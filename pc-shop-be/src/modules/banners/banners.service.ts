import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument, BannerType } from './schemas/banner.schema';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { CloudinaryService } from '../upload/cloudinary.service';

@Injectable()
export class BannersService {
    constructor(
        @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
        private readonly cloudinaryService: CloudinaryService
    ) {}

    async create(createBannerDto: CreateBannerDto): Promise<Banner> {
        const createdBanner = new this.bannerModel(createBannerDto);
        return createdBanner.save();
    }

    async findAll(): Promise<Banner[]> {
        return this.bannerModel.find().sort({ order: 1 }).exec();
    }

    async findByType(type: BannerType): Promise<Banner[]> {
        return this.bannerModel.find({ type, isActive: true }).sort({ order: 1 }).exec();
    }

    async findOne(id: string): Promise<Banner> {
        const banner = await this.bannerModel.findById(id).exec();
        if (!banner) {
            throw new NotFoundException(`Banner with ID ${id} not found`);
        }
        return banner;
    }

    async update(id: string, updateBannerDto: UpdateBannerDto): Promise<Banner> {
        const banner = await this.bannerModel.findById(id).exec();
        if (!banner) {
            throw new NotFoundException(`Banner with ID ${id} not found`);
        }

        // If there's a new image, delete the old one from Cloudinary
        if (updateBannerDto.imagePublicId && updateBannerDto.imagePublicId !== banner.imagePublicId) {
            await this.cloudinaryService.deleteImage(banner.imagePublicId);
        }

        const updatedBanner = await this.bannerModel
            .findByIdAndUpdate(id, updateBannerDto, { new: true })
            .exec();

        if (!updatedBanner) {
            throw new NotFoundException(`Banner with ID ${id} not found`);
        }

        return updatedBanner;
    }

    async remove(id: string): Promise<void> {
        const banner = await this.bannerModel.findById(id).exec();
        if (!banner) {
            throw new NotFoundException(`Banner with ID ${id} not found`);
        }

        // Delete the image from Cloudinary
        await this.cloudinaryService.deleteImage(banner.imagePublicId);

        await this.bannerModel.findByIdAndDelete(id).exec();
    }
} 