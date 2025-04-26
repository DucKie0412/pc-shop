import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CloudinaryService } from '../upload/cloudinary.service';

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const createdProduct = new this.productModel(createProductDto);
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
            updateProductDto.price = originalPrice - discountAmount;
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
                        price: updateProductDto.price // Ensure price is included in the update
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
            updateProductDto.price = originalPrice - discountAmount;
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
                        price: updateProductDto.price // Ensure price is included in the update
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
}
