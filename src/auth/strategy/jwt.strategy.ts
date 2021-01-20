import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { TokenPayload } from '../../token/tokenPayload';
import { TokenService } from '../../token/token.service';
import { ActionType } from '../../forceGuard/actionType.enum';
import { UnauthorizedException } from '../../forceGuard/unauthorized.exception';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('auth'),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(request: Request, payload: TokenPayload) {
    const token = request.body['auth'];
    const ip = request.clientIp;

    const user = await this.userService.getUserById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('Wrong credentials provided', ActionType.JWT);
    }
    const foundToken = await this.tokenService.findToken(user.id, token);
    if (!foundToken || !foundToken.active || foundToken.ip !== ip) {
      throw new UnauthorizedException('Wrong credentials provided', ActionType.JWT);
    }
    return {
      identity: user,
      token: foundToken,
    };
  }
}
