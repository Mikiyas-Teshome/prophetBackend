// custom-exceptions.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.EXPECTATION_FAILED,
        message,
        error: 'Expired Subscription',
      },
      HttpStatus.EXPECTATION_FAILED,
    );
  }
}
