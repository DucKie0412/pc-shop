import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateManufacturerDto {
  @IsString()
  @IsNotEmpty()
  name: string;


  @IsString()
  @IsOptional()
  logo?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsString()
  @IsNotEmpty()
  type: string;
} 