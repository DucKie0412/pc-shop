import { IsString, IsEmail, IsNotEmpty, IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderItemDto {
  @IsString() productId: string;
  @IsString() name: string;
  @IsNumber() price: number;
  @IsNumber() quantity: number;
  @IsOptional() @IsString() image?: string;
}

export class CreateOrderDto {
  @IsOptional() @IsString() userId?: string;
  @IsString() @IsNotEmpty() fullName: string;
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() address: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsOptional() @IsString() note?: string;
  @IsString() @IsNotEmpty() payment: string;
  @IsOptional() paymentStatus?: boolean;
  @IsArray() items: CreateOrderItemDto[];
  @IsNumber() total: number;
  @IsOptional() @IsString() status?: string;
} 