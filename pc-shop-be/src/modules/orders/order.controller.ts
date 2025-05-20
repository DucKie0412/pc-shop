import { Controller, Post, Body, Get, Query, Req, HttpException, HttpStatus } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Request } from 'express';
import { Public } from 'src/auth/decorator/customize-guard';
import { log } from 'node:console';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }
    @Public()
    @Post()
    async create(@Body() createOrderDto: CreateOrderDto) {
        try {
            const order = await this.orderService.create(createOrderDto);
            return { success: true, order };
        } catch (error) {
            throw new HttpException(
                { success: false, message: 'Tạo đơn hàng thất bại', error: error.message },
                HttpStatus.BAD_REQUEST
            );
        }
    }


    @Get('my')
    async getMyOrders(@Req() req: Request) {
        try {
            const userId = (req.user as any)?._id;
            if (!userId) throw new Error('Bạn chưa đăng nhập');
            return await this.orderService.findByUser(userId);
        } catch (error) {
            throw new HttpException(
                { success: false, message: 'Không thể lấy đơn hàng', error: error.message },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Public()
    @Get('lookup')
    async lookupOrder(
        @Query('email') email: string,
        @Query('phone') phone: string
    ) {
        try {
            if (!email || !phone) throw new Error('Thiếu thông tin email hoặc số điện thoại');
            return await this.orderService.findByEmailAndPhone(email, phone);
        } catch (error) {
            throw new HttpException(
                { success: false, message: 'Không thể tra cứu đơn hàng', error: error.message },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get()
    async getAllOrders() {
        try {
            return await this.orderService.findAll();
        } catch (error) {
            throw new HttpException(
                { success: false, message: 'Không thể lấy danh sách đơn hàng', error: error.message },
                HttpStatus.BAD_REQUEST
            );
        }
    }
} 