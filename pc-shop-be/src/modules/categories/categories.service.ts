import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async findOneBySlug(slug: string): Promise<Category | null> {
    return this.categoryModel.findOne({ slug }).exec();
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return updatedCategory;
  }

  async updateBySlug(slug: string, updateCategoryDto: UpdateCategoryDto): Promise<Category | null> {
    return this.categoryModel
      .findOneAndUpdate({ slug }, updateCategoryDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Category> {
    const deletedCategory = await this.categoryModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return deletedCategory;
  }

  async removeBySlug(slug: string): Promise<Category | null> {
    return this.categoryModel.findOneAndDelete({ slug }).exec();
  }
} 