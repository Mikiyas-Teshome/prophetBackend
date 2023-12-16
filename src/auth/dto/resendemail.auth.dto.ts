import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResendEmailAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
