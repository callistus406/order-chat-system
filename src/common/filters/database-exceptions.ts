import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected database error occurred.';

    this.logger.error(`Prisma Error Code: ${exception.code}`, exception.message);

    switch (exception.code) {
      case 'P2002':
        statusCode = HttpStatus.CONFLICT;
        message = 'A resource with this value already exists.';
        break;
      case 'P2003':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'A foreign key constraint failed.';
        break;
      case 'P2025':
        statusCode = HttpStatus.NOT_FOUND;
        message = 'The requested resource could not be found.';
        break;
      default:
        this.logger.warn(`Unhandled Prisma error: ${exception.code}`);
        break;
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error: 'Database Error',
    });
  }
}
