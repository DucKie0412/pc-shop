import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type BannerDocument = HydratedDocument<Banner>;

export enum BannerType {
    CAROUSEL = 'carousel',
    SUB_BANNER = 'sub_banner'
}

@Schema({ timestamps: true })
export class Banner extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    url: string;

    @Prop({ required: true })
    link: string;

    @Prop({ required: true })
    imagePublicId: string;

    @Prop({ required: true, enum: BannerType })
    type: BannerType;

    @Prop({ default: 0 })
    order: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner); 