import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, otp: number, currentYear: number) {
    this.mailerService
      .sendMail({
        to: user.email,
        // from: '"Prophet Tips" <support@example.com>', // override default from
        subject: 'Welcome, Confirm your Email',
        template: './verify', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          username: user.first_name + ' ' + user.last_name,
          otp: otp,
          email: user.email,
          currentYear: currentYear,
        },
      })
      .then(() => {
        // console.log("success "+x.toString())
      })
      .catch(() => {
        // console.log("error " + e)
      });
  }
  async sendResetPassConfirmation(
    user: User,
    otp: number,
    currentYear: number,
  ) {
    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Reset your password, Confirm your Email',
      template: './reset_pass', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        username: user.first_name + ' ' + user.last_name,
        otp: otp,
        email: user.email,
        currentYear: currentYear,
      },
    });
  }
}
