import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SigninAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
