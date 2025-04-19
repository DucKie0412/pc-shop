import { IsString, IsNumber, IsOptional, Min, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
    @IsNotEmpty({message: "Title is required"})
    @IsString()
    title: string;

    @IsNotEmpty({message: "Description is required"})
    @IsString()
    description: string;

    @IsNotEmpty({message: "Category ID is required"})
    @IsString()
    categoryId: string;

    @IsNumber()
    @Min(0)
    @Transform(({ value }) => parseInt(value, 10))
    stock: number;

    @IsNotEmpty({message: "Original price is required"})
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => parseInt(value, 10))
    originalPrice: number;

    @IsNumber()
    @Min(0)
    @Transform(({ value }) => parseInt(value, 10))
    discount: number;

    @IsNotEmpty({message: "Image is required"})
    @IsString()
    image?: string;
}
