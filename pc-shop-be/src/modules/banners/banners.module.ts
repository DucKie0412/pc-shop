import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { Banner, BannerSchema } from './schemas/banner.schema';
import { UploadModule } from '../upload/upload.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }]),
        UploadModule
    ],
    controllers: [BannersController],
    providers: [BannersService],
    exports: [BannersService]
})
export class BannersModule {} 