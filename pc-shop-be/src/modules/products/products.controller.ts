import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Get()
  async findAll() {
    return await this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    let product;
    // Check if the id is a valid MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      product = await this.productsService.findOne(id);
    } else {
      // If not an ObjectId, treat it as a slug
      product = await this.productsService.findOneBySlug(id);
    }
    return product;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    let product;
    // Check if the id is a valid MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      product = await this.productsService.update(id, updateProductDto);
    } else {
      // If not an ObjectId, treat it as a slug
      product = await this.productsService.updateBySlug(id, updateProductDto);
    }
    return product;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    // Check if the id is a valid MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      await this.productsService.remove(id);
    } else {
      // If not an ObjectId, treat it as a slug
      await this.productsService.removeBySlug(id);
    }
    return {
      statusCode: 200,
      message: "Product deleted successfully"
    };
  }
}
