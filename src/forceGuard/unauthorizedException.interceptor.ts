import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { UnauthorizedException } from './unauthorized.exception';
import { ForceGuardService } from './forceGuard.service';
import { ActionType } from './actionType.enum';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class UnauthorizedExceptionInterceptor implements NestInterceptor {
  constructor(private readonly forceGuardService: ForceGuardService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      catchError(async (error) => {
        if (!(error instanceof UnauthorizedException)) {
          throw error;
        }

        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const status = error.getStatus();
        const ip = request.clientIp;
        const type = error.type;

        let actionsToBan = 15;
        switch (type) {
          case ActionType.JWT:
            actionsToBan = 100;
            break;
          case ActionType.LOGIN:
            actionsToBan = 15;
            break;
          case ActionType.RESET_PASSWORD:
            actionsToBan = 3;
            break;
          case ActionType.RESET_2FA:
            actionsToBan = 3;
            break;
        }
        await this.forceGuardService.addActionWithBanCheck(ip, type, actionsToBan);
        throw new HttpException(error.message, status);
      }),
    );
  }
}
