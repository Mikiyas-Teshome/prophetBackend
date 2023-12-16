import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { FirebaseGoogleMiddleware } from './auth/middlewares/';
import { ScheduleModule } from '@nestjs/schedule';
import { PackagesModule } from './packages/packages.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PackagesModule,
    MailModule,
    ScheduleModule.forRoot(),
    SubscriptionModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FirebaseGoogleMiddleware).forRoutes(
      {
        path: '/auth/firebaseGoogleSignIn',
        method: RequestMethod.POST,
      },
      {
        path: '/auth/firebasePhoneSignIn',
        method: RequestMethod.POST,
      },
      {
        path: '/auth/firebasePhoneSignUp',
        method: RequestMethod.POST,
      },
    );
    // consumer.apply(FirebaseFacebookMiddleware).forRoutes({
    //   path: '/auth/firebaseFacebookSignIn', method: RequestMethod.POST
    // });
  }
}
