import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { EncryptionService } from './encryption.service';

@Catch(HttpException)
export class EncryptionFilter implements ExceptionFilter {
  constructor(private readonly encryptionService: EncryptionService) {}

  async catch(exception: HttpException, host: ArgumentsHost): Promise<any> {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const data = {
      statusCode: status,
      message: exception.message,
    };

    if (status === HttpStatus.NOT_ACCEPTABLE) {
      return res.status(status).json(data);
    }

    const pubPemBase64 = ctx.getRequest<Request>().body.key;
    const encryptedData = this.encryptionService.encrypt(data, pubPemBase64);
    res.status(status).send(encryptedData);
  }
}
