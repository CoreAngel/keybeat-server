import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EncryptionService } from './encryption.service';

@Injectable()
export class EncryptionMiddleware implements NestMiddleware {
  constructor(private encryptionService: EncryptionService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (typeof req.body !== 'string') {
      throw new HttpException('Wrong data type', HttpStatus.NOT_ACCEPTABLE);
    }
    try {
      req.body = await this.encryptionService.decrypt(req.body);
    } catch (e) {
      throw new HttpException('Invalid request data', HttpStatus.NOT_ACCEPTABLE);
    }

    if (typeof req.body.key !== 'string' || req.body.key.length > 0) {
      throw new HttpException('RSA public key required', HttpStatus.NOT_ACCEPTABLE);
    }

    next();
  }
}
