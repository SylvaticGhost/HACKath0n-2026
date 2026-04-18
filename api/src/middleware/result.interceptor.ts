import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Result } from 'shared'

@Injectable()
export class ResultInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof Result || (data && typeof data.statusCode === 'number')) {
          const response = context.switchToHttp().getResponse()
          response.status(data.statusCode)
        }
        return data
      }),
    )
  }
}
