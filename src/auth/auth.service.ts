import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  SigninAuthDto,
  SignupAuthDto,
  ResendEmailAuthDto,
  VerifyEmailAuthDto,
  PhoneAuthDto,
} from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Token } from './types';
import * as CryptoJS from 'crypto-js';
import { MailService } from 'src/mail/mail.service';
import { User } from '@prisma/client';
import { ResetPassAuthDto } from './dto/resetPass.auth.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
    private readonly httpService: HttpService,
  ) {}


  getHello(): string {
    return 'Congra it seems runing';
  }
  async signupLocal(dto: SignupAuthDto) {
    const hash = await this.hash(dto.password);
    const userExists = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (userExists && userExists.authProviders == 'LOCAL') {
      throw new ForbiddenException('user with this email already exists!');
    } else if (userExists && userExists.authProviders == 'GOOGLE') {
      const newUser = await this.prisma.user.update({
        where: {
          email: dto.email,
        },
        data: {
          hash: hash,
          first_name: dto.firstName,
          last_name: dto.lastName,
          authProviders: 'LOCAL',
          providerId: null,
        },
      });

      this.sendVerificationEmail(newUser);
      return {
        success:
          'A verification email has been sent to your email! Please verify',
      };
    } else {
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hash,
          first_name: dto.firstName,
          last_name: dto.lastName,
          authProviders: 'LOCAL',
        },
      });
      this.sendVerificationEmail(newUser);
      return {
        success:
          'A verification email has been sent to your email! Please verify',
      };
    }
    // const tokens = await this.getTokens(newUser.id,newUser.email);
    // await this.updateRefreshToken(newUser.id,tokens.refresh_token);

    //constants ..
    // username
    // otp
    // email
    // currentYear
    //liA8FgsFlhWAFdqI  ...emailpassword
  }

  async signinLocal(dto: SigninAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      include: {
        subscription: true,
        purchaseReference: true,
      },
    });
    if (!user) throw new ForbiddenException('User not found!');
    else if (!user.isVerified)
      throw new ForbiddenException('Please verify your email!');
    if (user.hash == null) {
      throw new ForbiddenException(
        'You have been signed using social Auth, so use Social Auth or reset your password!',
      );
    }
    const passwordMatchs = await bcrypt.compare(dto.password, user.hash);
    if (!passwordMatchs) throw new ForbiddenException('Incorrect credentials');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    delete user.hash;
    delete user.refreshToken;
    delete user.verificationHash;
    delete user.verificationHash;
    delete user.verificationCodeExpiresAt;
    delete user.createdAt;
    delete user.updatedAt;
    delete user.authProviders;
    delete user.providerId;
    delete user.isPassResetEnabled;
    delete user.isVerified;
    delete user.isActive;

    return { user, tokens };
  }

  async googleSignIn(user) {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const userExists = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
      include: {
        subscription: true,
        purchaseReference: true,
      },
    });
    if (!userExists) {
      try {
        const newUser = await this.prisma.user.create({
          data: {
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            isVerified: true,
            providerId: user.id,
            authProviders: 'GOOGLE',
          },
          include: {
            subscription: true,
            purchaseReference: true,
          },
        });
        const tokens = await this.getTokens(newUser.id, newUser.email);

        await this.updateRefreshToken(newUser.id, tokens.refresh_token);
        delete newUser.hash;
        delete newUser.refreshToken;
        delete newUser.verificationHash;
        delete newUser.verificationHash;
        delete newUser.verificationCodeExpiresAt;
        delete newUser.createdAt;
        delete newUser.updatedAt;
        delete newUser.authProviders;
        delete newUser.providerId;
        delete newUser.isPassResetEnabled;
        delete newUser.isVerified;
        delete newUser.isActive;
        return { newUser, tokens };
      } catch {
        throw new InternalServerErrorException();
      }
    } else if (userExists && userExists.authProviders == 'GOOGLE') {
      const tokens = await this.getTokens(userExists.id, userExists.email);

      await this.updateRefreshToken(userExists.id, tokens.refresh_token);
      delete userExists.hash;
      delete userExists.refreshToken;
      delete userExists.verificationHash;
      delete userExists.verificationHash;
      delete userExists.verificationCodeExpiresAt;
      delete userExists.createdAt;
      delete userExists.updatedAt;

      return {
        userExists,
        tokens,
      };
    } else if (userExists && userExists.authProviders != 'GOOGLE') {
      const newUser = await this.prisma.user.update({
        where: {
          id: userExists.email,
        },
        data: {
          first_name: user.firstName,
          last_name: user.lastName,
          isVerified: true,
          providerId: user.id,
          authProviders: 'GOOGLE',
        },
        include: {
          subscription: true,
          purchaseReference: true,
        },
      });
      const tokens = await this.getTokens(newUser.id, newUser.email);

      await this.updateRefreshToken(userExists.id, tokens.refresh_token);
      delete newUser.hash;
      delete newUser.refreshToken;
      delete newUser.verificationHash;
      delete newUser.verificationHash;
      delete newUser.verificationCodeExpiresAt;
      delete newUser.createdAt;
      delete newUser.updatedAt;
      delete newUser.authProviders;
      delete newUser.providerId;
      delete newUser.isPassResetEnabled;
      delete newUser.isVerified;
      delete newUser.isActive;

      return {
        newUser,
        tokens,
      };
    }
  }

  async firebaseGoogleSignIn(user) {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const userExists = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
      include: {
        subscription: true,
        purchaseReference: true,
      },
    });
    if (!userExists) {
      try {
        let firstName = '';
        let lastName = '';

        if (user.name && user.name.includes(' ')) {
          const nameParts = user.name.split(' ');
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        } else {
          // If 'name' field is not available or doesn't contain a space, you can handle it accordingly
          firstName = user.name;
          lastName = '';
        }
        const newUser = await this.prisma.user.create({
          data: {
            email: user.email,
            first_name: firstName,
            last_name: lastName,
            isVerified: true,
            providerId: user.uid,
            authProviders: 'GOOGLE',
          },
          include: {
            subscription: true,
            purchaseReference: true,
          },
        });
        const tokens = await this.getTokens(newUser.id, newUser.email);

        await this.updateRefreshToken(newUser.id, tokens.refresh_token);
        delete newUser.hash;
        delete newUser.refreshToken;
        delete newUser.verificationHash;
        delete newUser.verificationHash;
        delete newUser.verificationCodeExpiresAt;
        delete newUser.createdAt;
        delete newUser.updatedAt;
        delete newUser.authProviders;
        delete newUser.providerId;
        delete newUser.isPassResetEnabled;
        delete newUser.isVerified;
        delete newUser.isActive;
        return { user: newUser, tokens };
      } catch {
        throw new InternalServerErrorException();
      }
    } else if (userExists && userExists.authProviders == 'GOOGLE') {
      const tokens = await this.getTokens(userExists.id, userExists.email);

      await this.updateRefreshToken(userExists.id, tokens.refresh_token);
      delete userExists.hash;
      delete userExists.refreshToken;
      delete userExists.verificationHash;
      delete userExists.verificationHash;
      delete userExists.verificationCodeExpiresAt;
      delete userExists.createdAt;
      delete userExists.updatedAt;
      delete userExists.authProviders;
      delete userExists.providerId;
      delete userExists.isPassResetEnabled;
      delete userExists.isVerified;
      delete userExists.isActive;

      return {
        user: userExists,
        tokens,
      };
    } else if (userExists && userExists.authProviders != 'GOOGLE') {
      try {
        const newUser = await this.prisma.user.update({
          where: {
            id: userExists.id,
          },
          data: {
            email: user.email,
            isVerified: true,
            providerId: user.uid,
            authProviders: 'GOOGLE',
          },
          include: {
            subscription: true,
            purchaseReference: true,
          },
        });
        const tokens = await this.getTokens(newUser.id, newUser.email);

        await this.updateRefreshToken(userExists.id, tokens.refresh_token);
        delete newUser.hash;
        delete newUser.refreshToken;
        delete newUser.verificationHash;
        delete newUser.verificationHash;
        delete newUser.verificationCodeExpiresAt;
        delete newUser.createdAt;
        delete newUser.updatedAt;
        delete newUser.authProviders;
        delete newUser.providerId;
        delete newUser.isPassResetEnabled;
        delete newUser.isVerified;
        delete newUser.isActive;

        return {
          user: newUser,
          tokens,
        };
      } catch (err) {
        throw new InternalServerErrorException(err.message);
      }
    }
  }

  async firebasePhoneSignUp(user, dto: PhoneAuthDto) {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const userExists = await this.prisma.user.findUnique({
      where: {
        email: user.phone_number,
      },
    });
    if (!userExists) {
      try {
        const newUser = await this.prisma.user.create({
          data: {
            email: user.phone_number,
            first_name: dto.firstName,
            last_name: dto.lastName,
            isVerified: true,
            providerId: user.uid,
            authProviders: 'PHONE',
          },
        });
        const tokens = await this.getTokens(newUser.id, newUser.email);

        await this.updateRefreshToken(newUser.id, tokens.refresh_token);
        delete newUser.hash;
        delete newUser.refreshToken;
        delete newUser.verificationHash;
        delete newUser.verificationHash;
        delete newUser.verificationCodeExpiresAt;
        delete newUser.createdAt;
        delete newUser.updatedAt;
        delete newUser.authProviders;
        delete newUser.providerId;
        delete newUser.isPassResetEnabled;
        delete newUser.isVerified;
        delete newUser.isActive;
        return { user: newUser, tokens };
      } catch {
        throw new InternalServerErrorException();
      }
    } else if (userExists && userExists.authProviders == 'PHONE') {
      const tokens = await this.getTokens(userExists.id, userExists.email);

      await this.updateRefreshToken(userExists.id, tokens.refresh_token);
      delete userExists.hash;
      delete userExists.refreshToken;
      delete userExists.verificationHash;
      delete userExists.verificationHash;
      delete userExists.verificationCodeExpiresAt;
      delete userExists.createdAt;
      delete userExists.updatedAt;
      delete userExists.authProviders;
      delete userExists.providerId;
      delete userExists.isPassResetEnabled;
      delete userExists.isVerified;
      delete userExists.isActive;

      return {
        user: userExists,
        tokens,
      };
    }
  }

  async firebasePhoneSignIn(user) {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const userExists = await this.prisma.user.findUnique({
      where: {
        email: user.phone_number,
      },
    });
    if (userExists && userExists.authProviders == 'PHONE') {
      const tokens = await this.getTokens(userExists.id, userExists.email);

      await this.updateRefreshToken(userExists.id, tokens.refresh_token);
      delete userExists.hash;
      delete userExists.refreshToken;
      delete userExists.verificationHash;
      delete userExists.verificationHash;
      delete userExists.verificationCodeExpiresAt;
      delete userExists.createdAt;
      delete userExists.updatedAt;
      delete userExists.authProviders;
      delete userExists.providerId;
      delete userExists.isPassResetEnabled;
      delete userExists.isVerified;
      delete userExists.isActive;

      return {
        user: userExists,
        tokens,
      };
    } else if (!userExists) {
      throw new BadRequestException('Unregistered');
    }
    // }catch(err){
    //     throw new ForbiddenException(err.message);
    //   }
  }

  async facebookSignIn(user) {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const userExists = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });
    if (!userExists) {
      try {
        const newUser = await this.prisma.user.create({
          data: {
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            isVerified: true,
            providerId: user.id,
            authProviders: 'PHONE',
          },
        });
        const tokens = await this.getTokens(newUser.id, newUser.email);

        await this.updateRefreshToken(newUser.id, tokens.refresh_token);
        delete newUser.hash;
        delete newUser.refreshToken;
        delete newUser.verificationHash;
        delete newUser.verificationHash;
        delete newUser.verificationCodeExpiresAt;
        delete newUser.createdAt;
        delete newUser.updatedAt;
        delete newUser.authProviders;
        delete newUser.providerId;
        delete newUser.isPassResetEnabled;
        delete newUser.isVerified;
        delete newUser.isActive;
        return { newUser, tokens };
      } catch {
        throw new InternalServerErrorException();
      }
    } else if (userExists && userExists.authProviders == 'PHONE') {
      const tokens = await this.getTokens(userExists.id, userExists.email);

      await this.updateRefreshToken(userExists.id, tokens.refresh_token);
      delete userExists.hash;
      delete userExists.refreshToken;
      delete userExists.verificationHash;
      delete userExists.verificationHash;
      delete userExists.verificationCodeExpiresAt;
      delete userExists.createdAt;
      delete userExists.updatedAt;

      return {
        userExists,
        tokens,
      };
    } else if (userExists && userExists.authProviders != 'PHONE') {
      const newUser = await this.prisma.user.update({
        where: {
          id: userExists.email,
        },
        data: {
          first_name: user.firstName,
          last_name: user.lastName,
          isVerified: true,
          providerId: user.id,
          authProviders: 'PHONE',
        },
      });
      const tokens = await this.getTokens(newUser.id, newUser.email);

      await this.updateRefreshToken(userExists.id, tokens.refresh_token);
      delete newUser.hash;
      delete newUser.refreshToken;
      delete newUser.verificationHash;
      delete newUser.verificationHash;
      delete newUser.verificationCodeExpiresAt;
      delete newUser.createdAt;
      delete newUser.updatedAt;
      delete newUser.authProviders;
      delete newUser.providerId;
      delete newUser.isPassResetEnabled;
      delete newUser.isVerified;
      delete newUser.isActive;

      return {
        newUser,
        tokens,
      };
    }
  }

  async resetPassword(dto: ResetPassAuthDto) {
    const todaysDate = new Date();
    const hash = await this.hash(dto.password);

    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Access Denied!');
    } else if (!user.isPassResetEnabled) {
      throw new ForbiddenException("you can't change your password!");
    } else if (
      todaysDate.getTime() > user.verificationCodeExpiresAt.getTime()
    ) {
      throw new ForbiddenException('Expired!');
    } else if (dto.password != dto.confirmPassword) {
      throw new ForbiddenException("Passwords don't match!");
    }
    await this.prisma.user.update({
      where: {
        email: dto.email,
      },
      data: {
        hash: hash,
        verificationCodeExpiresAt: null,
        verificationHash: null,
        isVerified: true,
        isPassResetEnabled: false,
      },
    });
    return { success: 'You have successfully changed your password!' };
  }
  async logout(userId: string): Promise<boolean> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshToken: {
          not: null,
        },
      },
      data: {
        refreshToken: null,
      },
    });
    return true;
  }
  async resendVerificationOtp(dto: ResendEmailAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Access Denied!');
    } else if (user.isVerified) {
      throw new ForbiddenException('Already Verified User!');
    }
    this.sendVerificationEmail(user);
    return { success: 'we have sent a verification email to u!' };
  }

  async sendVerificationEmail(user: User) {
    // create user in db
    // ...
    // send confirmation mail
    // try {
    const otp = Math.floor(Math.random() * 90000) + 10000;

    let todaysDate = new Date();
    const currentYear = todaysDate.getFullYear();
    await this.mailService.sendUserConfirmation(user, otp, currentYear);

    todaysDate.setMinutes(todaysDate.getMinutes() + 2);

    const hashedOTP = await this.hash(otp.toString());

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verificationHash: hashedOTP,
        verificationCodeExpiresAt: todaysDate,
      },
    });
    // } catch (error) {
    //   throw new ForbiddenException("error message");
    // }
  }
  async sendPassResetVerificationEmail(dto: ResendEmailAuthDto) {
    // create user in db
    // ...
    // send confirmation mail
    try {
      const userExists = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (!userExists) {
        throw new ForbiddenException('User not Found!');
      }
      const otp = Math.floor(Math.random() * 90000) + 10000;

      let todaysDate = new Date();
      const currentYear = todaysDate.getFullYear();
      await this.mailService.sendResetPassConfirmation(
        userExists,
        otp,
        currentYear,
      );

      todaysDate.setMinutes(todaysDate.getMinutes() + 5);

      const hashedOTP = await this.hash(otp.toString());

      await this.prisma.user.update({
        where: {
          id: userExists.id,
        },
        data: {
          verificationHash: hashedOTP,
          verificationCodeExpiresAt: todaysDate,
        },
      });

      return { success: 'we have sent a verification email to u!' };
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }
  hash(data: string) {
    return bcrypt.hash(data, 10);
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<Token> {
    // console.log({userId});
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new ForbiddenException('Access Denied!');
    }
    const rtMatchs = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!rtMatchs) {
      throw new ForbiddenException('Access Denied');
    }
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }
  async verifyEmail(dto: VerifyEmailAuthDto) {
    // console.log({userId});
    const todaysDate = new Date();

    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Access Denied!');
    } else if (user.isVerified) {
      throw new ForbiddenException('Already Verified!');
    }
    const otpMatchs = await bcrypt.compare(dto.otp, user.verificationHash);
    if (!otpMatchs) {
      throw new ForbiddenException('Invalid OTP');
    } else if (
      todaysDate.getTime() > user.verificationCodeExpiresAt.getTime()
    ) {
      throw new ForbiddenException('Expired OTP!');
    }
    await this.prisma.user.updateMany({
      where: {
        email: dto.email,
        verificationCodeExpiresAt: {
          not: null,
        },
        verificationHash: {
          not: null,
        },
      },
      data: {
        verificationCodeExpiresAt: null,
        verificationHash: null,
        isVerified: true,
      },
    });
    return { success: 'You have sucessfuly verified your email!' };
  }
  async verifyResetPass(dto: VerifyEmailAuthDto) {
    // console.log({userId});
    let todaysDate = new Date();

    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Access Denied!');
    }
    if (user.verificationHash == null) {
      throw new ForbiddenException('Access Denied!');
    }
    const otpMatchs = await bcrypt.compare(dto.otp, user.verificationHash);
    if (!otpMatchs) {
      throw new ForbiddenException('Invalid OTP');
    } else if (
      todaysDate.getTime() > user.verificationCodeExpiresAt.getTime()
    ) {
      throw new ForbiddenException('Expired OTP!');
    }

    todaysDate.setMinutes(todaysDate.getMinutes() + 30);
    await this.prisma.user.updateMany({
      where: {
        email: dto.email,
        verificationHash: {
          not: null,
        },
      },
      data: {
        verificationCodeExpiresAt: todaysDate,
        verificationHash: null,
        isPassResetEnabled: true,
      },
    });
    return { success: 'You have sucessfuly verified your password reset!' };
  }

  async getTokens(userId: string, email: string): Promise<Token> {
    const [act, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.config.get('ACCESS_TOKEN'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.config.get('REFRESH_TOKEN'),
          expiresIn: 60 * 60 * 24 * 14,
        },
      ),
    ]);
    return {
      access_token: act,
      refresh_token: rt,
    };
  }
  async updateRefreshToken(userId: string, rtToken: string) {
    const rtHash = await this.hash(rtToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: rtHash,
      },
    });
  }
}
