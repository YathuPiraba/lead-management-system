import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  Logger,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Get status code from exception
    const status = exception.getStatus();

    // Extract response body
    const responseMessage = exception.getResponse();
    let message =
      typeof responseMessage === 'string'
        ? responseMessage
        : (responseMessage as any).message || 'Internal server error';

    // Log the exception with appropriate log level
    if (exception instanceof UnauthorizedException) {
      this.logger.warn(`${request.method} ${request.url} 401 ${message}`);
    } else if (exception instanceof ForbiddenException) {
      this.logger.warn(`${request.method} ${request.url} 403 ${message}`);
    } else if (exception instanceof NotFoundException) {
      this.logger.warn(`${request.method} ${request.url} 404 ${message}`);
    } else if (exception instanceof BadRequestException) {
      this.logger.warn(`${request.method} ${request.url} 400 ${message}`);
    } else {
      this.logger.error(
        `${request.method} ${request.url} ${status} ${message}`,
      );
    }

    // Send response back to the client
    response.status(status).json({
      statusCode: status,
      message,
      error: exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
