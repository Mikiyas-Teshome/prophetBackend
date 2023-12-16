import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { APP_FILTER } from '@nestjs/core';
import { SubscriptionController } from './subscription.controller';
import { HttpModule } from '@nestjs/axios';
import { ExpiredExceptionFilter } from 'src/common/custom_execption_filters';

@Module({
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: ExpiredExceptionFilter,
    },
  ],

  imports: [HttpModule],
})
export class SubscriptionModule {}
