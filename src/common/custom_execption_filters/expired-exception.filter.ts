// expired-exception.filter.ts
import {
  Catch,
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomException } from './custom.exception';

@Catch(CustomException)
export class ExpiredExceptionFilter implements ExceptionFilter {
  catch(exception: CustomException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json(exception.getResponse());
  }
}
