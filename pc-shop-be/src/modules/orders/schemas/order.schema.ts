import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  note?: string;

  @Prop({ required: true, type: [{ 
    productId: String, 
    name: String, 
    price: Number, 
    quantity: Number, 
    image: String 
  }] })
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }[];

  @Prop({ required: true })
  total: number;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ required: true })
  payment: string;

  @Prop({ type: Boolean, default: false })
  paymentStatus: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order); 