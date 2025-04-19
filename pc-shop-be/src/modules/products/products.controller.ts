import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Check if the id is a valid MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      return this.productsService.findOne(id);
    }
    // If not an ObjectId, treat it as a slug
    return this.productsService.findOneBySlug(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    // Check if the id is a valid MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      return this.productsService.update(id, updateProductDto);
    }
    // If not an ObjectId, treat it as a slug
    return this.productsService.updateBySlug(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // Check if the id is a valid MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      return this.productsService.remove(id);
    }
    // If not an ObjectId, treat it as a slug
    return this.productsService.removeBySlug(id);
  }
}
