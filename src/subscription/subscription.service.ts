import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PurchaseDto } from './dto';
import { PackageDurations } from '@prisma/client';

import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Convert, ChapaSerializer } from './json_serializers';
import { Response } from 'express';
import { CustomException } from 'src/common/custom_execption_filters';
import { GetVIPTipsDto } from './dto/getTips.dto';
@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async makePurchase(dto: PurchaseDto, userId: string) {
    // try {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('Not a valid user');
    }
    // const response = await this.chapa.verify({
    //   tx_ref: dto.trx_ref,
    // });

    const { data } = await firstValueFrom(
      this.httpService
        .get<AxiosResponse<any>>(
          `https://api.chapa.co/v1/transaction/verify/${dto.trx_ref}`,
          {
            headers: {
              Authorization:
                'Bearer CHASECK_TEST-2nzLyYG36nme9U5LiGx5GQReInHkhIyQ',
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error.message);
            throw 'An error happened!';
          }),
        ),
    );
    const response = Convert.toChapaSerializer(JSON.stringify(data));
    if (response) {
      const isOldPurchase = await this.prisma.purchaseReference.findUnique({
        where: { trx: dto.trx_ref },
      });

      if (isOldPurchase) {
        throw new ForbiddenException('This purchase has already been made!');
      } else {
        const purchasdPackage = await this.prisma.package.findUnique({
          where: { id: dto.packageId },
        });
        if (
          response.data.currency == 'ETB' &&
          response.data.amount != purchasdPackage.priceIn_etb
        ) {
          throw new ForbiddenException(
            "The purchase ammount & the package price doesn't match",
          );
        } else if (
          response.data.currency == 'USD' &&
          response.data.amount != purchasdPackage.priceIn_usd
        ) {
          throw new ForbiddenException(
            "The purchase ammount & the package price doesn't match",
          );
        } else {
          const isitRenewedPurchase = await this.isRenewedPurchase(user.id);

          if (isitRenewedPurchase) {
            const daysLeftToExpire = await this.daysLefttoExpire(userId);
            console.log('daysLeftToExpire: ' + daysLeftToExpire);
            const startDate = new Date();

            const endDate = new Date();

            if (purchasdPackage.duration == PackageDurations.ONE_WEEK)
              endDate.setDate(endDate.getDate() + 7 + daysLeftToExpire);
            else if (purchasdPackage.duration == PackageDurations.TWO_WEEK)
              endDate.setDate(endDate.getDate() + 15 + daysLeftToExpire);
            else if (purchasdPackage.duration == PackageDurations.ONE_MONTH)
              endDate.setDate(endDate.getDate() + 30 + daysLeftToExpire);
            else if (purchasdPackage.duration == PackageDurations.TWO_MONTH)
              endDate.setDate(endDate.getDate() + 60 + daysLeftToExpire);
            else if (purchasdPackage.duration == PackageDurations.THREE_MONTH)
              endDate.setDate(endDate.getDate() + 90 + daysLeftToExpire);
            else if (purchasdPackage.duration == PackageDurations.SIX_MONTH)
              endDate.setDate(endDate.getDate() + 180 + daysLeftToExpire);
            else if (purchasdPackage.duration == PackageDurations.YEARLY)
              endDate.setDate(endDate.getDate() + 366 + daysLeftToExpire);

            return await this.prisma.purchaseReference.update({
              where: { userId: user.id },
              data: {
                packageId: purchasdPackage.id,
                userId: user.id,
                trx: dto.trx_ref,
                currency: response.data.currency,
                ammount: response.data.amount,
                subscription: {
                  update: {
                    startDate: startDate,
                    endDate: endDate,
                    isActive: true,
                    isRenewed: true,
                    userId: user.id,
                    packageId: purchasdPackage.id,
                  },
                },
              },
              include: {
                subscription: true,
              },
            });
          } else {
            const startDate = new Date();

            const endDate = new Date();
            if (purchasdPackage.duration == PackageDurations.ONE_WEEK)
              endDate.setDate(endDate.getDate() + 7);
            else if (purchasdPackage.duration == PackageDurations.TWO_WEEK)
              endDate.setDate(endDate.getDate() + 15);
            else if (purchasdPackage.duration == PackageDurations.ONE_MONTH)
              endDate.setDate(endDate.getDate() + 30);
            else if (purchasdPackage.duration == PackageDurations.TWO_MONTH)
              endDate.setDate(endDate.getDate() + 60);
            else if (purchasdPackage.duration == PackageDurations.THREE_MONTH)
              endDate.setDate(endDate.getDate() + 90);
            else if (purchasdPackage.duration == PackageDurations.SIX_MONTH)
              endDate.setDate(endDate.getDate() + 180);
            else if (purchasdPackage.duration == PackageDurations.YEARLY)
              endDate.setDate(endDate.getDate() + 366);

            return this.prisma.purchaseReference.create({
              data: {
                packageId: purchasdPackage.id,
                userId: user.id,
                trx: dto.trx_ref,
                currency: response.data.currency,
                ammount: response.data.amount,
                subscription: {
                  create: {
                    startDate: startDate,
                    endDate: endDate,
                    isActive: true,
                    isRenewed: false,
                    userId: user.id,
                    packageId: purchasdPackage.id,
                  },
                },
              },
              include: {
                subscription: true,
              },
            });
          }
        }
      }
    } else {
      throw new InternalServerErrorException('Failed to verify the payment');
    }
    // } catch (error) {
    //   if (!(error instanceof ForbiddenException ) && !(error instanceof BadRequestException )) {
    //     // Manually handle the ForbiddenException response
    //     throw new InternalServerErrorException(error.message);
    //   }

    //   // console.log(err);

    // }
  }

  async getTips(userId: string, dto: GetVIPTipsDto) {
    const isPurchaseExpired = await this.isPurchaseExpired(userId);
    if (!isPurchaseExpired) {
      // const { data } = await firstValueFrom(
      //   this.httpService
      //     .get<AxiosResponse<any>>(
      //       `https://api.totaltipsbet.com/v1/b2c/coupons?page=0&max=50&category=637275700d4707f88edbc904&purchases=%5Bobject%20Object%5D%2C%5Bobject%20Object%5D%2C%5Bobject%20Object%5D%2C%5Bobject%20Object%5D%2C%5Bobject%20Object%5D%2C%5Bobject%20Object%5D&mode=NEWEST`,
      //       {

      //         headers: {
      //           application:
      //             '63762d7ba4b7b40ec4f71fe1',
      //         },
      //       },
      //     )
      //     .pipe(
      //       catchError((error: AxiosError) => {
      //         console.log(error.message);
      //         throw 'An error happened!';
      //       }),
      //     ),
      // );
      try {
        const response: AxiosResponse<any> = await axios.get(
          'https://api.totaltipsbet.com/v1/b2c/coupons',
          {
            params: {
              page: 0,
              max: 50,
              category: dto.categoryId,
              purchases:
                '%5Bobject%20Object%5D%2C%5Bobject%20Object%5D%2C%5Bobject%20Object%5D%2C%5Bobject%20Object%5D%2C%5Bobject%20Object%5D%2C%5Bobject%20Object%5D',
              mode: dto.mode,
            },
            headers: {
              application: '63762d7ba4b7b40ec4f71fe1',
            },
          },
        );

        const { data } = response;
        return data;

        // Handle the data here...
      } catch (error) {
        // Handle errors
        console.error(error.message);
        throw new InternalServerErrorException('An error happened!');
      }
    } else {
      // return response.status(HttpStatus.EXPECTATION_FAILED).json({
      //   statusCode: HttpStatus.EXPECTATION_FAILED,
      //   message:"You don't have any active subscription",
      //   error:"Expired Subscription"
      // });
      throw new CustomException("You don't have any active subscription");
    }
  }
  async isRenewedPurchase(userId: string): Promise<Boolean> {
    const isRenewedPurchase = await this.prisma.purchaseReference.findUnique({
      where: {
        userId: userId,
      },
    });
    if (isRenewedPurchase) {
      return true;
    } else {
      return false;
    }
  }

  async isPurchaseExpired(userId: string): Promise<Boolean> {
    const currentDate = new Date();
    const isPurchaseExpired = await this.prisma.subscription.findUnique({
      where: {
        userId: userId,
      },
    });
    if (isPurchaseExpired != null) {
      const expirationDate = new Date(isPurchaseExpired.endDate);
      if (expirationDate > currentDate) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  async getCurrentUserSubscription(userId: string) {
    //  try{
    const currentUserSubscription = await this.prisma.subscription.findUnique({
      where: {
        userId: userId,
      },

      include: {
        purchaseReference: true,
      },
    });

    if (currentUserSubscription) {
      const packages = await this.prisma.package.findUnique({
        where: {
          id: currentUserSubscription.packageId,
        },
      });
      delete packages.createdAt;
      delete packages.updatedAt;
      delete currentUserSubscription.createdAt;
      delete currentUserSubscription.updatedAt;
      delete currentUserSubscription.userId;
      delete currentUserSubscription.purchaseReferenceId;
      delete currentUserSubscription.purchaseReference.createdAt;
      delete currentUserSubscription.purchaseReference.updatedAt;
      return { currentUserSubscription, packages };
    } else {
      throw new NotFoundException(
        'You currently do not have an active subscription to any package.',
      );
    }
    // }catch(err){
    //     throw new InternalServerErrorException("Something went wrong");
    //   }
  }

  async daysLefttoExpire(userId: string): Promise<number> {
    const currentDate = new Date();
    const isPurchaseExpired = await this.prisma.subscription.findUnique({
      where: {
        userId: userId,
      },
    });
    const expirationDate = new Date(isPurchaseExpired.endDate);
    if (expirationDate > currentDate) {
      // const dayDifference = expirationDate.getDate() - currentDate.getDate();
      const timeDifference = Math.abs(
        expirationDate.getTime() - currentDate.getTime(),
      );
      const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

      return daysDifference;
    } else {
      return 0;
    }
  }
}

/*


    // const response = await this.chapa.verify({
    //   tx_ref: dto.trx_ref,
    // });
    const purchasdPackage = await this.prisma.package.findUnique({
      where: { id: dto.packageId },
    });
    //
    if (true) {
      // if (
      //   response.data.currency == 'ETB' &&
      //   parseFloat(response.data.amount) != purchasdPackage.priceIn_etb
      // ) {
      //   throw new ForbiddenException(
      //     "The purchase ammount & the package price doesn't match",
      //   );
      // } else if (
      //   response.data.currency == 'USD' &&
      //   parseFloat(response.data.amount) != purchasdPackage.priceIn_usd
      // ) {
      //   throw new ForbiddenException(
      //     "The purchase ammount & the package price doesn't match",
      //   );
      // }
      if (false) {
      } else {
        try {
          const isOldPurchase = await this.prisma.purchaseReference.findUnique({
            where: { trx: dto.trx_ref },
          });

          if (isOldPurchase) {
            throw new ForbiddenException('This purchase is already made!');
          } else if (!this.isRenewedPurchase(user.id)) {
            const startDate = new Date();

            const endDate = new Date();
            if (purchasdPackage.duration == PackageDurations.ONE_WEEK)
              endDate.setDate(endDate.getDate() + 7);
            else if (purchasdPackage.duration == PackageDurations.TWO_WEEK)
              endDate.setDate(endDate.getDate() + 15);
            else if (purchasdPackage.duration == PackageDurations.ONE_MONTH)
              endDate.setDate(endDate.getDate() + 30);
            else if (purchasdPackage.duration == PackageDurations.TWO_MONTH)
              endDate.setDate(endDate.getDate() + 60);
            else if (purchasdPackage.duration == PackageDurations.THREE_MONTH)
              endDate.setDate(endDate.getDate() + 90);
            else if (purchasdPackage.duration == PackageDurations.SIX_MONTH)
              endDate.setDate(endDate.getDate() + 180);
            else if (purchasdPackage.duration == PackageDurations.YEARLY)
              endDate.setDate(endDate.getDate() + 366);

            const purchaseReference =
              await this.prisma.purchaseReference.update({
                where:{userId:user.id},
                data: {
                  packageId: purchasdPackage.id,
                  userId: user.id,
                  trx: dto.trx_ref,
                  currency: 'USD',
                  ammount: 77.5,
                  subscription: {
                    update: {
                      startDate: startDate,
                      endDate: endDate,
                      isActive: true,
                      isRenewed: false,
                      userId: user.id,
                      packageId: purchasdPackage.id,
                    },
                  },
                },
                include: {
                  subscription: true,
                },
              });

            if (purchaseReference) {
              return purchaseReference;
            }
          } else {
            if (!this.isPurchaseExpired(user.id)) {
              const startDate = new Date();

              const endDate = new Date();
              const daysLeftToExpire =  await this.daysLefttoExpire(user.id)
              
              if (purchasdPackage.duration == PackageDurations.ONE_WEEK)
              endDate.setDate(endDate.getDate() + 7+ daysLeftToExpire);
              else if (purchasdPackage.duration == PackageDurations.TWO_WEEK)
              endDate.setDate(endDate.getDate() + 15+ daysLeftToExpire);
              else if (purchasdPackage.duration == PackageDurations.ONE_MONTH)
              endDate.setDate(endDate.getDate() + 30+ daysLeftToExpire);
              else if (purchasdPackage.duration == PackageDurations.TWO_MONTH)
              endDate.setDate(endDate.getDate() + 60+ daysLeftToExpire);
              else if (purchasdPackage.duration == PackageDurations.THREE_MONTH)
              endDate.setDate(endDate.getDate() + 90 + daysLeftToExpire);
              else if (purchasdPackage.duration == PackageDurations.SIX_MONTH)
              endDate.setDate(endDate.getDate() + 180+ daysLeftToExpire);
              else if (purchasdPackage.duration == PackageDurations.YEARLY)
              endDate.setDate(endDate.getDate() + 366+ daysLeftToExpire);

              const purchaseReference =
                await this.prisma.purchaseReference.create({
                  data: {
                    packageId: purchasdPackage.id,
                    userId: user.id,
                    trx: dto.trx_ref,
                    currency: 'USD',
                    ammount: 77.5,
                    subscription: {
                      create: {
                        startDate: startDate,
                        endDate: endDate,
                        isActive: true,
                        isRenewed: false,
                        userId: user.id,
                        packageId: purchasdPackage.id,
                      },
                    },
                  },
                  include: {
                    subscription: true,
                  },
                });

              if (purchaseReference) {
                return purchaseReference;
              }
            }
          }
        } catch (err) {
          console.log(err);
          throw new InternalServerErrorException(err);
        }
      }
    } else {
      throw new ForbiddenException("The purchase wasn't successful");
    }
*/
