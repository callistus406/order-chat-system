import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { ResponseDto } from '../dto/response.dto';
  import { CustomException } from '../exceptions/custom.exception';
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);
  
    catch(exception: any, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message: string | object = 'Internal Server Error';
  
      if (exception instanceof CustomException) {
        status = exception.getStatus();
        message = exception.message || 'A custom exception occurred';
      } 
      else if (exception instanceof HttpException) {
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        message =
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).message || 'Unknown error';
      } 
      else {
        this.logger.error(
          `Uncaught Exception: ${exception?.message || exception}`,
          exception?.stack || '',
        );
        message = 'An unexpected error occurred. Please try again later.';
      }
  
      this.logger.error(
        `Status: ${status}, Error: ${JSON.stringify(message)}, Path: ${
          request?.url || 'unknown'
        }`
      );
        
        console.log(message)
  
      response.status(status).json(
        new ResponseDto(
          status,
          'Request failed',
          null,
          typeof message === 'string' || typeof message === "object" ? message : 'An error occurred',
        //   typeof message === 'string' ? message : 'An error occurred',
        )
      );
    }
  }
  