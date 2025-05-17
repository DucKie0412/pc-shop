import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BannerType } from '../schemas/banner.schema';

export class CreateBannerDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    url: string;

    @IsString()
    @IsNotEmpty()
    link: string;

    @IsString()
    @IsNotEmpty()
    imagePublicId: string;

    @IsEnum(BannerType)
    @IsNotEmpty()
    type: BannerType;

    @IsNumber()
    @IsOptional()
    order?: number;

    @IsOptional()
    isActive?: boolean;
} 