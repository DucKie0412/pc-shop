import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { CategoryType } from '../schemas/category.schema';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  type?: CategoryType;
} 