import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Cart extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: Types.ObjectId;

    @Prop({
        type: [
            {
                _id: String,
                name: String,
                price: Number,
                quantity: Number,
                image: String,
            },
        ],
        default: [],
    })
    items: Array<{
        _id: string;
        name: string;
        price: number;
        quantity: number;
        image?: string;
    }>;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
