import { PackageDurations } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdatePackagesDto {
  @IsNotEmpty()
  packageId: string;

  packageName: string;

  packageDes: string;

  packagePriceInETB: number;

  packagePriceInUSD: number;

  packageDuration: PackageDurations;
}
