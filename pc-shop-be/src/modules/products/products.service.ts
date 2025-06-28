import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument, RedeemHistorySchema } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CloudinaryService } from '../upload/cloudinary.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel('RedeemHistory') private redeemHistoryModel: Model<any>,
        private readonly cloudinaryService: CloudinaryService,
        private readonly mailerService: MailerService
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        // Debug log to check received DTO
        console.log('Creating product with DTO:', JSON.stringify(createProductDto, null, 2));
        // Calculate final price
        const discountAmount = (createProductDto.originalPrice * createProductDto.discount) / 100;
        const finalPrice = createProductDto.originalPrice - discountAmount;

        const createdProduct = new this.productModel({
            ...createProductDto,
            finalPrice
        });

        return createdProduct.save();
    }

    async findAll(): Promise<Product[]> {
        return this.productModel.find()
            .populate('categoryId')
            .populate('manufacturerId')
            .exec();
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productModel.findById(id)
            .populate('categoryId')
            .populate('manufacturerId')
            .exec();
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }

    async findOneBySlug(slug: string): Promise<Product> {
        const product = await this.productModel.findOne({ slug })
            .populate('categoryId')
            .populate('manufacturerId')
            .exec();
        if (!product) {
            throw new NotFoundException(`Product with slug ${slug} not found`);
        }
        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        // Remove undefined values from updateProductDto
        Object.keys(updateProductDto).forEach(key => 
            updateProductDto[key] === undefined && delete updateProductDto[key]
        );

        // Calculate the final price if originalPrice or discount is updated
        if (updateProductDto.originalPrice !== undefined || updateProductDto.discount !== undefined) {
            const product = await this.findOne(id);
            const originalPrice = updateProductDto.originalPrice ?? product.originalPrice;
            const discount = updateProductDto.discount ?? product.discount;
            const discountAmount = (originalPrice * discount) / 100;
            updateProductDto.finalPrice = originalPrice - discountAmount;
        }

        try {
            // First, check if the product exists
            const existingProduct = await this.productModel.findById(id);
            if (!existingProduct) {
                throw new NotFoundException(`Product with ID ${id} not found`);
            }

            // Update the product using updateOne for more direct control
            await this.productModel.updateOne(
                { _id: id },
                { 
                    $set: {
                        ...updateProductDto,
                        finalPrice: updateProductDto.finalPrice // Ensure finalPrice is included in the update
                    }
                }
            );

            // Fetch the updated product to return with populated fields
            const updatedProduct = await this.productModel.findById(id)
                .populate('categoryId')
                .populate('manufacturerId')
                .exec();

            if (!updatedProduct) {
                throw new NotFoundException(`Product with ID ${id} not found after update`);
            }

            return updatedProduct;
        } catch (error) {
            throw error;
        }
    }

    async updateBySlug(slug: string, updateProductDto: UpdateProductDto): Promise<Product> {
        // Remove undefined values from updateProductDto
        Object.keys(updateProductDto).forEach(key => 
            updateProductDto[key] === undefined && delete updateProductDto[key]
        );

        // Calculate the final price if originalPrice or discount is updated
        if (updateProductDto.originalPrice !== undefined || updateProductDto.discount !== undefined) {
            const product = await this.findOneBySlug(slug);
            const originalPrice = updateProductDto.originalPrice ?? product.originalPrice;
            const discount = updateProductDto.discount ?? product.discount;
            const discountAmount = (originalPrice * discount) / 100;
            updateProductDto.finalPrice = originalPrice - discountAmount;
        }

        try {
            // First, check if the product exists
            const existingProduct = await this.productModel.findOne({ slug });
            if (!existingProduct) {
                throw new NotFoundException(`Product with slug ${slug} not found`);
            }

            // Update the product using updateOne for more direct control
            await this.productModel.updateOne(
                { slug },
                { 
                    $set: {
                        ...updateProductDto,
                        finalPrice: updateProductDto.finalPrice // Ensure finalPrice is included in the update
                    }
                }
            );

            // Fetch the updated product to return with populated fields
            const updatedProduct = await this.productModel.findOne({ slug })
                .populate('categoryId')
                .populate('manufacturerId')
                .exec();

            if (!updatedProduct) {
                throw new NotFoundException(`Product with slug ${slug} not found after update`);
            }

            return updatedProduct;
        } catch (error) {
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        const product = await this.findOne(id);

        // Delete all associated images
        for (const publicId of product.imagePublicIds) {
            await this.cloudinaryService.deleteImage(publicId);
        }

        // Delete the product
        const result = await this.productModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
    }

    async removeBySlug(slug: string): Promise<void> {
        const result = await this.productModel.findOneAndDelete({ slug }).exec();
        if (!result) {
            throw new NotFoundException(`Product with slug ${slug} not found`);
        }
    }

    async findByType(type: string): Promise<Product[]> {
        const result = await this.productModel.find({ type })
            .populate('categoryId')
            .populate('manufacturerId')
            .exec();
        return result;
    }

    async findByName(name: string): Promise<Product[]> {
        return this.productModel.find({ name: { $regex: name, $options: 'i' } })
            .populate('categoryId')
            .populate('manufacturerId')
            .exec();
    }

    async getBestSaleProducts(): Promise<Product[]> {
        return this.productModel.find()
            .sort({ soldCount: -1 })
            .limit(15)
            .populate('categoryId')
            .populate('manufacturerId')
            .exec();
    }

    async findRedeemable(): Promise<Product[]> {
        return this.productModel.find({ isRedeemable: true })
            .populate('categoryId')
            .populate('manufacturerId')
            .exec();
    }

    async redeemProduct(productId: string, userId: string) {
        const product = await this.productModel.findById(productId);
        if (!product || !product.isRedeemable) throw new NotFoundException('Product not redeemable');
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');
        if ((user.points ?? 0) < (product.requirePoint ?? 0)) throw new Error('Not enough points');
        user.points -= product.requirePoint;
        await user.save();
        // Save redeem history with logging and error handling
        try {
            const history = await this.redeemHistoryModel.create({
                userId,
                productId,
                productName: product.name,
                requirePoint: product.requirePoint,
                redeemedAt: new Date()
            });
            console.log('Redeem history created:', history);
        } catch (err) {
            console.error('Error creating redeem history:', err);
        }
        // Send email
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Đổi thưởng thành công tại DuckieStore',
            template: 'redeem-success',
            context: {
                name: user.name || user.email,
                productName: product.name,
                requirePoint: product.requirePoint,
                pointsLeft: user.points
            }
        });
        return { message: 'Redeem successful', points: user.points };
    }

    async getRedeemHistory(userId: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.redeemHistoryModel.find({ userId })
                .sort({ redeemedAt: -1 })
                .skip(skip)
                .limit(limit),
            this.redeemHistoryModel.countDocuments({ userId })
        ]);
        return {
            data: items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
}
