import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ForceGuardService } from './forceGuard.service';
import { ipAddressExtractor } from '../decorators/ipAddress.decorator';

@Injectable()
export default class ForceGuardGuard implements CanActivate {
  constructor(private configService: ConfigService, private forceGuardService: ForceGuardService) {}

  async canActivate(context: ExecutionContext) {
    const ip = ipAddressExtractor(context);

    const timeOffset = this.configService.get<number>('BAN_TIME');
    const result = await this.forceGuardService.getNewestBan(ip);
    if (!result) {
      return true;
    }

    const isBanned = Date.now() < result.date.getTime() + timeOffset * 1000;
    if (isBanned) {
      throw new HttpException('Your ip is banned', HttpStatus.UNAUTHORIZED);
    }
    return true;
  }
}
