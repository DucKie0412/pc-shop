import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RefundRequest, RefundRequestDocument } from './schemas/refund-request.schema';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { Order, OrderDocument } from '../orders/schemas/order.schema'; // Assuming Order schema location
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema'; // Import UserDocument

@Injectable()
export class RefundsService {
    constructor(
        @InjectModel(RefundRequest.name) private refundRequestModel: Model<RefundRequestDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        private mailerService: MailerService,
        private usersService: UsersService,
    ) { }

    async create(userId: string, createRefundRequestDto: CreateRefundRequestDto): Promise<RefundRequestDocument> {
        const { orderId, products, reason } = createRefundRequestDto;

        // Find and validate the order
        const order = await this.orderModel.findOne({ _id: orderId, user: userId }).exec();
        if (!order) {
            throw new NotFoundException('Order not found or does not belong to the user');
        }

        // Validate products requested for refund against the order items
        for (const requestedProduct of products) {
            const orderItem = order.items.find(
                (item) => item.productId.toString() === requestedProduct.product
            );

            if (!orderItem) {
                throw new BadRequestException(
                    `Product with ID ${requestedProduct.product} not found in the order`,
                );
            }

            if (requestedProduct.quantity <= 0 || requestedProduct.quantity > orderItem.quantity) {
                throw new BadRequestException(
                    `Invalid quantity for product with ID ${requestedProduct.product}`,
                );
            }
        }

        // Create the refund request
        const createdRefundRequest = new this.refundRequestModel({
            order: new Types.ObjectId(orderId),
            user: new Types.ObjectId(userId),
            products: products.map(p => ({ product: new Types.ObjectId(p.product), quantity: p.quantity })),
            reason,
            status: 'pending',
        });

        // Save and return the request
        return createdRefundRequest.save();
    }

    async findAll(): Promise<RefundRequestDocument[]> {
        return this.refundRequestModel.find().populate('user', 'email name').exec();
    }

    async approveRefund(refundId: string): Promise<RefundRequestDocument> {
        const refundRequest = await this.refundRequestModel.findById(refundId).exec();
        if (!refundRequest) {
            throw new NotFoundException('Refund request not found');
        }
        if (refundRequest.status !== 'pending') {
            throw new BadRequestException('Only pending refund requests can be approved');
        }
        refundRequest.status = 'approved';

        // Find the associated order and update its status
        const order = await this.orderModel.findById(refundRequest.order).exec();
        if (order) {
            order.status = 'approved';
            await order.save();
        }

        // Fetch user and send email
        const user = await this.usersService.findOne(refundRequest.user.toString());
        if (user) {
            await this.mailerService.sendMail({
                to: user.email,
                subject: 'Your Refund Request Has Been Approved',
                template: 'refund-approved',
                context: {
                    userName: user.name || user.email,
                    refundId: (refundRequest._id as any).toString(),
                    orderId: refundRequest.order.toString(),
                    reason: refundRequest.reason,
                    // Include other relevant details from refundRequest
                },
            });
        }

        return refundRequest.save();
    }

    async rejectRefund(refundId: string): Promise<RefundRequestDocument> {
        const refundRequest = await this.refundRequestModel.findById(refundId).exec();
        if (!refundRequest) {
            throw new NotFoundException('Refund request not found');
        }
        if (refundRequest.status !== 'pending') {
            throw new BadRequestException('Only pending refund requests can be rejected');
        }
        refundRequest.status = 'rejected';

        // Find the associated order and update its status (optional, depending on desired flow)
        const order = await this.orderModel.findById(refundRequest.order).exec();
        if (order) {
            order.status = 'rejected'; 
            await order.save();
        }


        // Fetch user and send email
        const user = await this.usersService.findOne(refundRequest.user.toString());
        if (user) {
            await this.mailerService.sendMail({
                to: user.email,
                subject: 'Your Refund Request Has Been Rejected',
                template: 'refund-rejected',
                context: {
                    userName: user.name || user.email,
                    refundId: (refundRequest._id as any).toString(),
                    orderId: refundRequest.order.toString(),
                    reason: refundRequest.reason,
                },
            });
        }

        return refundRequest.save();
    }
} 