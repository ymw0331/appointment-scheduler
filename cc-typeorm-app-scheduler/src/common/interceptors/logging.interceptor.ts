import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const requestId = uuid();
    request.id = requestId;

    const now = Date.now();
    this.logger.log(`[${requestId}] ${method} ${url} - Request started`);

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `[${requestId}] ${method} ${url} - Response sent (${responseTime}ms)`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `[${requestId}] ${method} ${url} - Error occurred (${responseTime}ms): ${error.message}`,
          );
        },
      }),
    );
  }
}