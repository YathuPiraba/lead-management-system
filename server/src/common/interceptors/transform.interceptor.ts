import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T = any> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
  }> {
    if (context.getType() !== 'http') {
      return next.handle();
    }
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();

        const defaultMessage = 'Request was successful';
        const statusCode = response.statusCode || HttpStatus.OK;

        const message = response.locals?.message || defaultMessage;

        // Return the structured response
        return {
          statusCode,
          success: true,
          message,
          data,
        };
      }),
    );
  }
}
