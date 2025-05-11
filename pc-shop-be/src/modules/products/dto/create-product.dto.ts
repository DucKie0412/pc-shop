import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsEnum, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';
import { ProductType } from '../schemas/product.schema';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(ProductType)
    @IsNotEmpty({ message: "Product type is required" })
    type: ProductType;

    @IsNotEmpty({ message: "Category ID is required" })
    @IsString()
    categoryId: string;

    @IsNotEmpty({ message: "Manufacturer ID is required" })
    @IsString()
    manufacturerId: string;

    @IsNumber()
    @Min(0)
    @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
    stock: number;

    @IsNotEmpty({ message: "Original price is required" })
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
    originalPrice: number;

    @IsNotEmpty({ message: "Discount is required" })
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
    discount: number;

    @IsNumber()
    @IsOptional()
    price?: number;  // Nếu cần tính tự động

    @IsObject()
    @IsNotEmpty({ message: "Product specifications are required" })
    specs: Record<string, any>;

    @IsArray()
    @IsOptional()
    images: string[];

    @IsArray()
    @IsOptional()
    imagePublicIds: string[];
}
