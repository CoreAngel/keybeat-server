import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fromBase64, randomBytes, toBase64 } from "../libs/src/functions/utils";
import {
  aesDecrypt,
  aesEncrypt,
  prvKeyFromPem,
  pubKeyFromPem,
  rsaDecrypt,
  rsaEncrypt,
} from '../libs/src/functions/crypto';

interface EncryptType {
  key: string;
  data: string;
}

@Injectable()
export class EncryptionService {
  constructor(private configService: ConfigService) {}

  async encrypt(data: any, pemBase64: string): Promise<EncryptType> {
    const pubKeyPem = fromBase64(pemBase64);
    const pubKey = pubKeyFromPem(pubKeyPem);
    const stringData = JSON.stringify(data);
    const aesKey = randomBytes(32);
    const key = rsaEncrypt(aesKey, pubKey);
    const encryptedData = aesEncrypt(aesKey, stringData);
    return {
      key,
      data: toBase64(encryptedData),
    };
  }

  async decrypt(data: EncryptType): Promise<any> {
    const pemBase64 = this.configService.get<string>('RSA_PRIVATE_KEY');
    const prvKeyPem = fromBase64(pemBase64);
    const prvKey = prvKeyFromPem(prvKeyPem);
    const aesKey = rsaDecrypt(data.key, prvKey);
    const stringData = aesDecrypt(aesKey, fromBase64(data.data));
    return JSON.parse(stringData);
  }
}
