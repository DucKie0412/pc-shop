import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefundRequestDocument = RefundRequest & Document;

@Schema({
  timestamps: true,
})
export class RefundRequest {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop([
    {
      product: { type: Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
    },
  ])
  products: { product: Types.ObjectId; quantity: number }[];

  @Prop({ required: true })
  reason: string;

  @Prop({ type: String, enum: ['pending', 'approved', 'rejected', 'processing', 'completed'], default: 'pending' })
  status: string;

  @Prop({ type: String })
  adminNotes?: string;
}

export const RefundRequestSchema = SchemaFactory.createForClass(RefundRequest); 