import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PhoneAuthDto, SigninAuthDto, SignupAuthDto } from './dto';
import {
  ActGuard,
  FacebookOauthGuard,
  GoogleOauthGuard,
  RtGuard,
} from '../common/guards';
import { GetCurrentUser } from '../common/decorators';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { Token } from './types';
import { ResendEmailAuthDto } from './dto/resendemail.auth.dto';
import { VerifyEmailAuthDto } from './dto/verifyemail.auth.dto copy';
import { ResetPassAuthDto } from './dto/resetPass.auth.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {


  constructor(private authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.authService.getHello();
  }

  @Post('signupLocal')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() dto: SignupAuthDto) {
    return this.authService.signupLocal(dto);
  }

  @Post('signinLocal')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: SigninAuthDto) {
    return this.authService.signinLocal(dto);
  }

  @Post('resendEmail')
  @HttpCode(HttpStatus.OK)
  resendEmail(@Body() dto: ResendEmailAuthDto) {
    return this.authService.resendVerificationOtp(dto);
  }

  @Post('verifyEmail')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() dto: VerifyEmailAuthDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('sendResetPassVerification')
  @HttpCode(HttpStatus.OK)
  sendResetPassVerification(@Body() dto: ResendEmailAuthDto) {
    return this.authService.sendPassResetVerificationEmail(dto);
  }
  @Post('resetPassVerification')
  @HttpCode(HttpStatus.OK)
  resetPassVerification(@Body() dto: VerifyEmailAuthDto) {
    return this.authService.verifyResetPass(dto);
  }

  @Post('resetPassword')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPassAuthDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('googleSignin')
  @UseGuards(GoogleOauthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleSignIn() {}

  @Get('google/callback')
  @HttpCode(HttpStatus.OK)
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req) {
    return await this.authService.googleSignIn(req.user);
  }

  @Get('/facebook')
  @UseGuards(FacebookOauthGuard)
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Post('/firebaseGoogleSignIn')
  @HttpCode(HttpStatus.OK)
  async firebaseGoogle(@Req() request: Request): Promise<any> {
    return await this.authService.firebaseGoogleSignIn(request['user']);
  }

  @Post('/firebasePhoneSignIn')
  @HttpCode(HttpStatus.OK)
  async firebasePhoneSignIn(@Req() request: Request): Promise<any> {
    return await this.authService.firebasePhoneSignIn(request['user']);
    // return request['user'];
  }

  @Post('/firebasePhoneSignUp')
  @HttpCode(HttpStatus.OK)
  async firebasePhoneSignUp(
    @Req() request: Request,
    @Body() dto: PhoneAuthDto,
  ): Promise<any> {
    return await this.authService.firebasePhoneSignUp(request['user'], dto);
  }

  @Get('/facebookSignIn')
  @HttpCode(HttpStatus.OK)
  @UseGuards(FacebookOauthGuard)
  async facebookLoginRedirect(@Req() req): Promise<any> {
    return await this.authService.googleSignIn(req.user);
  }

  @UseGuards(ActGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: string): Promise<boolean> {
    return this.authService.logout(userId);
  }

  @UseGuards(RtGuard)
  @Post('refreshToken')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Token> {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  googleLogin() {
    // Initiates the Google OAuth process
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  googleLoginCallback() {
    // Handles the Google OAuth callback
  }

  @Post('google/token') // Add a new route to handle the token from the Android side
  async handleGoogleToken(@Body() tokenData: { idToken: string }) {
    const { idToken } = tokenData;

    // Validate the idToken using Credential Manager or other methods
    // Generate JWT token and handle user validation
  }
}
