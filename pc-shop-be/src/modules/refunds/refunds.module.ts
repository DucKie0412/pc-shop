import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RefundRequest, RefundRequestSchema } from './schemas/refund-request.schema';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { Order, OrderSchema } from '../orders/schemas/order.schema'; // Import Order schema
import { UsersModule } from '../users/users.module'; // Import UsersModule

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefundRequest.name, schema: RefundRequestSchema },
      { name: Order.name, schema: OrderSchema }, // Import Order model
    ]),
    UsersModule, // Import UsersModule here
  ],
  providers: [RefundsService],
  controllers: [RefundsController],
  exports: [RefundsService] // Export the service if needed by other modules
})
export class RefundsModule {}
