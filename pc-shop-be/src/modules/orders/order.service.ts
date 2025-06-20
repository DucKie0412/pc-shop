import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderModel.create(createOrderDto);
  }

  async findById(id: string) {
    return this.orderModel.findById(id);
  }

  

  async findByUser(userId: string) {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findByEmailAndPhone(email: string, phone: string) {
    return this.orderModel.find({ email, phone }).sort({ createdAt: -1 });
  }

  async findAll() {
    return this.orderModel.find().sort({ createdAt: -1 });
  }

  async updateOrder(id: string, update: any) {
    return this.orderModel.findByIdAndUpdate(id, update, { new: true });
  }

  async remove(id: string): Promise<Order> {
    const deletedOrder = await this.orderModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedOrder) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return deletedOrder;
  }
} 