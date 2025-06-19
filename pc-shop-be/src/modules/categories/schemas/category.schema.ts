import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;


@Schema({ timestamps: true })
export class Category extends Document {
    _id: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop()
    description?: string;

    @Prop()
    image?: string;

}

export const CategorySchema = SchemaFactory.createForClass(Category);
