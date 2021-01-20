import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '../forceGuard/unauthorized.exception';
import { ActionType } from '../forceGuard/actionType.enum';

@Injectable()
export default class JwtGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw new UnauthorizedException('Wrong credentials provided', ActionType.JWT);
    }
    return user;
  }
}
