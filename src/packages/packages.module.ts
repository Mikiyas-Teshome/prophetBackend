import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PackagesService, PrismaService],
  controllers: [PackagesController],
})
export class PackagesModule {}
