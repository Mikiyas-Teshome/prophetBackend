import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { Package } from '@prisma/client';
import { PackagesDto, UpdatePackagesDto } from './dto';
import { promises } from 'dns';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packageService: PackagesService) {}
  @Get()
  async getAllPackages(): Promise<Package[]> {
    return this.packageService.getAllPackages();
  }
  @Get(':id')
  async getPackage(@Param('id') id: string): Promise<Package> {
    return this.packageService.getPackage(id);
  }
  @Post()
  async createPackage(@Body() dto: PackagesDto): Promise<Package> {
    return this.packageService.createPackage(dto);
  }
  @Put()
  async updatePackage(@Body() dto: UpdatePackagesDto): Promise<Package> {
    return this.packageService.updatePackage(dto);
  }
  @Delete(':id')
  async deletePackage(@Param('id') id: string): Promise<Package> {
    return this.packageService.deletePackage(id);
  }
}
