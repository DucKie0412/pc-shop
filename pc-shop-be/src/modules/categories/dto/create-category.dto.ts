import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { CategoryType } from '../schemas/category.schema';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  type?: CategoryType;
} 