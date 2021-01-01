import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { UnauthorizedException } from './unauthorized.exception';
import { ForceGuardService } from './forceGuard.service';
import { ActionType } from './actionType.enum';
import { Response, Request } from 'express';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  constructor(private readonly forceGuardService: ForceGuardService) {}

  async catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const ip = request.clientIp;
    const type = exception.type;

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

    return response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
