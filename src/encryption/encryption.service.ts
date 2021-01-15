import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fromBase64 } from '../libs/src/functions/utils';
import { prvKeyFromPem, pubKeyFromPem, rsaDecrypt, rsaEncrypt } from '../libs/src/functions/crypto';

@Injectable()
export class EncryptionService {
  constructor(private configService: ConfigService) {}

  async encrypt(data: any, pemBase64: string): Promise<string> {
    const pubKeyPem = fromBase64(pemBase64);
    const pubKey = pubKeyFromPem(pubKeyPem);
    const stringData = JSON.stringify(data);
    return rsaEncrypt(stringData, pubKey);
  }

  async decrypt(data: string): Promise<any> {
    const pemBase64 = this.configService.get<string>('RSA_PRIVATE_KEY');
    const prvKeyPem = fromBase64(pemBase64);
    const prvKey = prvKeyFromPem(prvKeyPem);
    const stringData = rsaDecrypt(data, prvKey);
    return JSON.parse(stringData);
  }
}
