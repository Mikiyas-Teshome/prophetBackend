import { PackageDurations } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class PackagesDto {
  @IsNotEmpty()
  packageName: string;
  @IsNotEmpty()
  packageDes: string;
  @IsNotEmpty()
  @IsNumber()
  packagePriceInETB: number;
  @IsNotEmpty()
  @IsNumber()
  packagePriceInUSD: number;
  @IsNotEmpty()
  @IsEnum(PackageDurations)
  packageDuration: PackageDurations;
}
