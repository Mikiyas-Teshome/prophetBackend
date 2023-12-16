import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailAuthDto {
  @IsString()
  @IsNotEmpty()
  otp: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
