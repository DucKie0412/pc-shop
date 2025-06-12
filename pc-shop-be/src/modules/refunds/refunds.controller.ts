import { Controller, Post, Body, UseGuards, Req, Get, Patch, Param } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';
import { Request } from 'express';
import { RefundRequestDocument } from './schemas/refund-request.schema';

@UseGuards(JwtAuthGuard)
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  async create(@Body() createRefundRequestDto: CreateRefundRequestDto, @Req() req: Request) {
    // Assuming user information is attached to the request by JwtAuthGuard
    const userId = (req.user as any).sub; // Correctly extract user ID from JWT payload
    return this.refundsService.create(userId, createRefundRequestDto);
  }

  @Get()
  async findAll(): Promise<RefundRequestDocument[]> {
    return this.refundsService.findAll();
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string): Promise<RefundRequestDocument> {
    return this.refundsService.approveRefund(id);
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string): Promise<RefundRequestDocument> {
    return this.refundsService.rejectRefund(id);
  }
} 