import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Package } from '@prisma/client';
import { PurchaseDto } from './dto';
import { promises } from 'dns';
import { ActGuard } from 'src/common/guards';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { get } from 'http';
import { GetVIPTipsDto } from './dto/getTips.dto';
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(ActGuard)
  @Get('makePurchase')
  async makePurchase(
    @Query() dto: PurchaseDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.subscriptionService.makePurchase(dto, userId);
  }

  @UseGuards(ActGuard)
  @Get('getVipTips')
  async getVipTips(
    @GetCurrentUserId() userId: string,
    @Query() dto: GetVIPTipsDto,
  ) {
    return this.subscriptionService.getTips(userId, dto);
  }

  @UseGuards(ActGuard)
  @Get('getCurrentUserSubscription')
  async getCurrentUserSubscription(@GetCurrentUserId() userId: string) {
    return this.subscriptionService.getCurrentUserSubscription(userId);
  }
}
