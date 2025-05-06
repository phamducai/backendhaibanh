import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error occurred';

    // Handle common Prisma errors
    switch (exception.code) {
      case 'P2002': // Unique constraint failed
        status = HttpStatus.CONFLICT;
        message = `Unique constraint violation on: ${exception.meta?.target as string}`;
        break;
      case 'P2025': // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;
      case 'P2003': // Foreign key constraint failed
        status = HttpStatus.BAD_REQUEST;
        message = 'Related record not found';
        break;
      case 'P2014': // Required relation violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Required relation missing';
        break;
      case 'P2015': // Related record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Related record not found';
        break;
    }

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
      code: exception.code
    };

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message} (${exception.code})`,
      exception.stack
    );

    response.status(status).json(responseBody);
  }
}
