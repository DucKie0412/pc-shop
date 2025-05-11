import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

export enum CategoryType {
  CPU = 'cpu',
  GPU = 'gpu',
  RAM = 'ram',
  SSD = 'ssd',
  MAINBOARD = 'mainboard',
  PSU = 'psu',
  CASE = 'case',
  MONITOR = 'monitor',
  OTHER = 'other'
}

@Schema({ timestamps: true })
export class Category extends Document {
    _id: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop()
    description?: string;

    @Prop()
    image?: string;

    @Prop({ required: false, enum: CategoryType })
    type?: CategoryType;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
