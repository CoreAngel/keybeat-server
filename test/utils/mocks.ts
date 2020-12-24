import { RegisterDto } from '../../src/auth/dto/registerDto';
import { UserEntity } from '../../src/user/user.entity';
import { LoginDto } from '../../src/auth/dto/loginDto';
import { authenticator } from 'otplib';
import { CredentialEntity } from '../../src/credential/credential.entity';

export const registerDto: RegisterDto = {
  name: 'user',
  login: 'login',
  password: 'secretPassword',
  salt: 'salt',
};

export const userEntity: UserEntity = {
  name: 'user',
  login: 'login',
  password: '$2b$10$UNXCEMGIUFbGgXUALkAxIO/AZ1dTQtTr11RW9l4qn/xspeOlO7YAi',
  salt: 'salt',
  toptSecret: 'M5PTII3UDJ3TUAZI',
  toptReset: 'login-ba157e0ab94de8b9ecb21e57faed5202081fcc7f9b00beb2',
};

export const loginDto: LoginDto = {
  login: 'login',
  password: 'secretPassword',
  token: authenticator.generate(userEntity.toptSecret),
};

export const credentialsEntity: CredentialEntity = {
  iv: 'iv',
  data: 'data',
  userId: 1,
  lastModified: new Date(),
};
