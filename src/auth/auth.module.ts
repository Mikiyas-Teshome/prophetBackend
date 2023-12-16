import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ActStrategy, GoogleStrategy, RtStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [JwtModule.register({}), MailModule, HttpModule],
  controllers: [AuthController],
  providers: [AuthService, ActStrategy, RtStrategy, GoogleStrategy],
})
export class AuthModule {}
