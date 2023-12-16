import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PhoneAuthDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;
  @IsNotEmpty()
  @IsString()
  lastName: string;
}
