import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    // Get the request details
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    // Log request details
    this.logger.log(`${method} ${url} - Request started`);

    // Handle the request and measure the time taken
    return next.handle().pipe(
      tap(() => {
        const elapsedTime = Date.now() - now;
        this.logger.log(
          `${method} ${url} - Request completed in ${elapsedTime}ms`,
        );
      }),
    );
  }
}
