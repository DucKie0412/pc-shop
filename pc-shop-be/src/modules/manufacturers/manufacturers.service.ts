import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Manufacturer } from './schemas/manufacturer.schema';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';

@Injectable()
export class ManufacturersService {
  constructor(
    @InjectModel(Manufacturer.name) private manufacturerModel: Model<Manufacturer>,
  ) {}

  async create(createManufacturerDto: CreateManufacturerDto): Promise<Manufacturer> {
    const createdManufacturer = new this.manufacturerModel(createManufacturerDto);
    return createdManufacturer.save();
  }

  async findAll(): Promise<Manufacturer[]> {
    return this.manufacturerModel.find().exec();
  }

  async findOne(id: string): Promise<Manufacturer> {
    const manufacturer = await this.manufacturerModel.findById(id).exec();
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer with ID ${id} not found`);
    }
    return manufacturer;
  }

  async findOneBySlug(slug: string): Promise<Manufacturer | null> {
    return this.manufacturerModel.findOne({ slug }).exec();
  }

  async update(id: string, updateManufacturerDto: UpdateManufacturerDto): Promise<Manufacturer> {
    const updatedManufacturer = await this.manufacturerModel
      .findByIdAndUpdate(id, updateManufacturerDto, { new: true })
      .exec();
    if (!updatedManufacturer) {
      throw new NotFoundException(`Manufacturer with ID ${id} not found`);
    }
    return updatedManufacturer;
  }

  async updateBySlug(slug: string, updateManufacturerDto: UpdateManufacturerDto): Promise<Manufacturer | null> {
    return this.manufacturerModel
      .findOneAndUpdate({ slug }, updateManufacturerDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Manufacturer> {
    const deletedManufacturer = await this.manufacturerModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedManufacturer) {
      throw new NotFoundException(`Manufacturer with ID ${id} not found`);
    }
    return deletedManufacturer;
  }

  async removeBySlug(slug: string): Promise<Manufacturer | null> {
    return this.manufacturerModel.findOneAndDelete({ slug }).exec();
  }
} 