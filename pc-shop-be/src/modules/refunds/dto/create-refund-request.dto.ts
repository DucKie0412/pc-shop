import { IsNotEmpty, IsString, IsMongoId, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RefundProductDto {
  @IsMongoId()
  @IsNotEmpty()
  product: string; // Product ID

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateRefundRequestDto {
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RefundProductDto)
  products: RefundProductDto[];

  @IsString()
  @IsNotEmpty()
  reason: string;
} 