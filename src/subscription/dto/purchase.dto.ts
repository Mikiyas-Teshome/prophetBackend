import { PackageDurations } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class PurchaseDto {
  @IsNotEmpty()
  trx_ref: string;
  @IsNotEmpty()
  packageId: string;
  // @IsNotEmpty()
  // userId:string;
}
