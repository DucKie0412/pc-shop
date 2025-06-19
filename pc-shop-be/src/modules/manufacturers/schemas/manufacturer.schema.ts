import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ManufacturerDocument = HydratedDocument<Manufacturer>;

export enum ManufacturerType {
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
export class Manufacturer extends Document {
    _id: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop()
    logo?: string;

    @Prop()
    website?: string;

    @Prop({ required: true, enum: ManufacturerType })
    type?: ManufacturerType;
}

export const ManufacturerSchema = SchemaFactory.createForClass(Manufacturer); 