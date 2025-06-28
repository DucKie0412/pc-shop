import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Query, Req, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public } from 'src/auth/decorator/customize-guard';
import { ProductType } from './schemas/product.schema';
import { validateSync } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    try {
      console.log('Received DTO:', JSON.stringify(createProductDto, null, 2)); // Log incoming data
      const product = await this.productsService.create(createProductDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: "Product created successfully",
        data: product
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create product',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Public()
  @Get('redeemable')
  async getRedeemableProducts() {
    return await this.productsService.findRedeemable();
  }

  @Public()
  @Get()
  async findAll(@Query('type') type?: string, @Query('name') name?: string) {
    if (name) {
      return await this.productsService.findByName(name);
    }
    if (type) {
      const cleanType = type.replace(/\?$/, '');
      return await this.productsService.findByType(cleanType as ProductType);
    }
    return await this.productsService.findAll();
  }

  @Public()
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

  @Public()
  @Get('best-sale')
  async getBestSaleProducts() {
    return await this.productsService.getBestSaleProducts();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/redeem')
  async redeemProduct(@Param('id') id: string, @Req() req) {
    const userId = req.user._id;
    return await this.productsService.redeemProduct(id, userId);
  }

  @Get('redeem/history/:userId')
  async getRedeemHistory(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return await this.productsService.getRedeemHistory(userId, Number(page), Number(limit));
  }
}
