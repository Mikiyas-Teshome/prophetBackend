import { PackageDurations } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class GetVIPTipsDto {
  @IsNotEmpty()
  categoryId: string;
  @IsNotEmpty()
  mode: string;
  // @IsNotEmpty()
  // userId:string;
}
