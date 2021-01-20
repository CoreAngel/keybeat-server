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

    const errResponse = exception.getResponse();
    let message;
    if (status === 400) {
      message = typeof errResponse === 'string' ? errResponse : (errResponse as any).message;
    } else {
      message = exception.message;
    }
    const data = {
      statusCode: status,
      message: message,
    };

    if (status === HttpStatus.NOT_ACCEPTABLE) {
      res.status(status).json(data);
    } else {
      const pubPemBase64 = ctx.getRequest<Request>().body.key;
      const encryptedData = await this.encryptionService.encrypt(data, pubPemBase64);
      res.status(status).json(encryptedData);
    }
  }
}
