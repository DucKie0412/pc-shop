import { Controller, Post, Body, Get, Query, Req, HttpException, HttpStatus, Param, Patch, Delete } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Request } from 'express';
import { Public } from 'src/auth/decorator/customize-guard';
import { UpdateOrderDto } from './dto/update-order.dto';

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
    @Get('revenue')
    async getRevenue(@Query('mode') mode: string) {
        return await this.orderService.getRevenue(mode);
    }

    @Public()
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

    @Public()
    @Get(':id')
    async getOrderById(@Param('id') id: string) {
        try {
            return await this.orderService.findById(id);
        } catch (error) {
            throw new HttpException(
                { success: false, message: 'Không thể lấy đơn hàng', error: error.message },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const deletedOrder = await this.orderService.remove(id);
        if (!deletedOrder) {
            return { statusCode: 404, message: 'Order not found' };
        }
        return { statusCode: 200, message: 'Order deleted', data: deletedOrder };
    }


    @Patch(':id')
    async updateOrder(
        @Param('id') id: string,
        @Body() updateOrderDto: UpdateOrderDto
    ) {
        try {
            const updated = await this.orderService.updateOrder(id, updateOrderDto);
            return { success: true, order: updated };
        } catch (error) {
            throw new HttpException(
                { success: false, message: 'Không thể cập nhật đơn hàng', error: error.message },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    // WARNING: This endpoint is public for demo. In production, payment status should only 
    // be set by the backend after real payment verification (adding OTP for payment)
    @Public()
    @Patch(':id/payment-status')
    async updatePaymentStatus(
        @Param('id') id: string,
        @Body('paymentStatus') paymentStatus: boolean
    ) {
        try {
            const updated = await this.orderService.updateOrder(id, { paymentStatus });
            return { success: true, order: updated };
        } catch (error) {
            throw new HttpException(
                { success: false, message: 'Không thể cập nhật trạng thái thanh toán', error: error.message },
                HttpStatus.BAD_REQUEST
            );
        }
    }
} 