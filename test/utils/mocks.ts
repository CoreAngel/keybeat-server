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
  password:
    '3773867997184d6e:d44519d0107b0e798080b0f09696b2735af7786b9842b9c7715e26e64907c0f97a22893a5114b4d506ec851421565e0c34c604e6b16021f63b24c313e6c93e9d',
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
