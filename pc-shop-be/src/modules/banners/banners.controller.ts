import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerType } from './schemas/banner.schema';
import { Public } from 'src/auth/decorator/customize-guard';

@Controller('banners')
export class BannersController {
    constructor(private readonly bannersService: BannersService) {}

    @Post()
    create(@Body() createBannerDto: CreateBannerDto) {
        return this.bannersService.create(createBannerDto);
    }

    @Public()
    @Get()
    findAll(@Query('type') type?: BannerType) {
        if (type) {
            const cleanType = type.replace(/\?$/, '');
            return this.bannersService.findByType(cleanType as BannerType);
        }
        return this.bannersService.findAll();
    }

    @Public()
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bannersService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
        return this.bannersService.update(id, updateBannerDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bannersService.remove(id);
    }
} 