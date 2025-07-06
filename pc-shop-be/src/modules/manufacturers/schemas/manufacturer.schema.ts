import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ManufacturerDocument = HydratedDocument<Manufacturer>;

@Schema({ timestamps: true })
export class Manufacturer extends Document {
    _id: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop()
    logo?: string;

    @Prop()
    website?: string;

    @Prop({ required: true})
    type?: string;
}

export const ManufacturerSchema = SchemaFactory.createForClass(Manufacturer); 