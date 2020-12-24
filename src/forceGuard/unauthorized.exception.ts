import { HttpException, HttpStatus } from '@nestjs/common';
import { ActionType } from './actionType.enum';

export class UnauthorizedException extends HttpException {
  constructor(message: string, public readonly type: ActionType) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
