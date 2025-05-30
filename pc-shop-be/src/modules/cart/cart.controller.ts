import { Controller, Get, Post, Delete, Body, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/auth/decorator/customize-guard';

@Controller('cart')
@UseGuards(AuthGuard('jwt')) 
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req) {
    const userId = req.user._id; 
    const cart = await this.cartService.getCart(userId);
    return { items: cart.items };
  }

  @Post()
  async updateCart(@Req() req, @Body() body: CreateCartDto) {
    const userId = req.user._id;
    const cart = await this.cartService.updateCart(userId, body.items);
    return { items: cart.items };
  }

  @Public()
  @Delete()
  async clearCart(@Req() req) {
    const userId = req.user._id;
    const cart = await this.cartService.clearCart(userId);
    return { items: cart?.items || [] };
  }
}
