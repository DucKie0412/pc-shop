import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = await this.orderModel.create(createOrderDto);

    // If payment method is COD, immediately update stock, soldCount, and user points
    if (order.payment === 'cod') {
      // Calculate points
      const earnedPoints = Math.floor(order.total / 10000);
      order.earnedPoints = earnedPoints;
      await order.save();

      // Award points to user if userId exists
      if (order.userId) {
        await this.userModel.findByIdAndUpdate(
          order.userId,
          { $inc: { points: earnedPoints } }
        );
      }

      // Decrease stock and increase soldCount for each product in the order
      for (const item of order.items) {
        await this.productModel.findByIdAndUpdate(
          item.productId,
          {
            $inc: { stock: -item.quantity, soldCount: item.quantity }
          }
        );
      }
    }

    return order;
  }

  async findById(id: string) {
    return this.orderModel.findById(id);
  }

  

  async findByUser(userId: string) {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findByEmailAndPhone(email: string, phone: string) {
    return this.orderModel.find({ email, phone }).sort({ createdAt: -1 });
  }

  async findAll() {
    return this.orderModel.find().sort({ createdAt: -1 });
  }

  async updateOrder(id: string, update: any) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    // If paymentStatus is being set to true and was previously false
    if (
      update.paymentStatus === true &&
      order.paymentStatus === false
    ) {
      // Calculate points
      const earnedPoints = Math.floor(order.total / 10000);
      update.earnedPoints = earnedPoints;

      // Award points to user if userId exists
      if (order.userId) {
        await this.userModel.findByIdAndUpdate(
          order.userId,
          { $inc: { points: earnedPoints } }
        );
      }

      // Decrease stock and increase soldCount for each product in the order
      for (const item of order.items) {
        await this.productModel.findByIdAndUpdate(
          item.productId,
          {
            $inc: { stock: -item.quantity, soldCount: item.quantity }
          }
        );
      }
    }

    return this.orderModel.findByIdAndUpdate(id, update, { new: true });
  }

  async remove(id: string): Promise<Order> {
    const deletedOrder = await this.orderModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedOrder) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return deletedOrder;
  }
} 