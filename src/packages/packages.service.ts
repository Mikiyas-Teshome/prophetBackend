import { Injectable } from '@nestjs/common';
import { Package } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PackagesDto, UpdatePackagesDto } from './dto';
@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async getAllPackages() {
    return this.prisma.package.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
  async getPackage(id: string): Promise<Package | null> {
    return this.prisma.package.findUnique({ where: { id: id } });
  }
  async createPackage(dto: PackagesDto): Promise<Package | null> {
    return this.prisma.package.create({
      data: {
        packageName: dto.packageName,
        packageDes: dto.packageDes,
        priceIn_usd: dto.packagePriceInUSD,
        priceIn_etb: dto.packagePriceInETB,
        duration: dto.packageDuration,
      },
    });
  }

  async updatePackage(dto: UpdatePackagesDto): Promise<Package | null> {
    return this.prisma.package.update({
      where: {
        id: dto.packageId,
      },
      data: {
        packageName: dto.packageName,
        packageDes: dto.packageDes,
        priceIn_usd: dto.packagePriceInUSD,
        priceIn_etb: dto.packagePriceInETB,
        duration: dto.packageDuration,
      },
    });
  }
  async deletePackage(id: string) {
    return this.prisma.package.delete({
      where: { id: id },
    });
  }
}
