import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNotEmpty({ message: "Category ID is required" })
    @IsString()
    categoryId: string;

    @IsNotEmpty({ message: "Manufacturer ID is required" })
    @IsString()
    manufacturerId: string;

    @IsNumber()
    @Min(0)
    @Transform(({ value }) => parseInt(value, 10))
    stock: number;

    @IsNotEmpty({ message: "Original price is required" })
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => parseInt(value, 10))
    originalPrice: number;

    @IsNotEmpty({ message: "Discount is required" })
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => parseInt(value, 10))
    discount: number;

    @IsNumber()
    @IsOptional()
    price?: number;  // Nếu cần tính tự động

    @IsArray()
    @IsOptional()
    images: string[];

    @IsArray()
    @IsOptional()
    imagePublicIds: string[];
}
