import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/registerDto';
import { randomHexString } from '../libs/src/utils';
import { bcrypt, bcryptCompare } from '../libs/src/crypto';
import { PostgresErrorCode } from '../database/postgresErrorCodes.enum';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  crateUri(userName: string, service: string, secret: string): string {
    return authenticator.keyuri(userName, service, secret);
  }

  async hashPassword(password: string) {
    return bcrypt(password, 10);
  }

  async generateToptKeys() {
    return {
      toptSecret: authenticator.generateSecret(),
      toptReset: randomHexString(48),
    };
  }

  async register({ name, login, password, salt }: RegisterDto) {
    const user = await this.userService.getUserByLogin(login);
    if (user) {
      throw new HttpException('User with that email already exists', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await this.hashPassword(password);
    const { toptSecret, toptReset } = await this.generateToptKeys();

    try {
      const newUser = await this.userService.create({
        name,
        login,
        password: hashedPassword,
        salt,
        toptSecret,
        toptReset,
      });
      newUser.password = undefined;
      return newUser;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException('User with that email already exists', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async resetPassword(user: UserEntity, password: string, salt: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password);
    return await this.userService.updatePassword({
      ...user,
      password: hashedPassword,
      salt,
    });
  }

  async resetTopt(user: UserEntity, toptSecret: string, toptReset: string): Promise<boolean> {
    return await this.userService.updateTopt({
      ...user,
      toptSecret,
      toptReset,
    });
  }

  async verifyUser(login: string): Promise<UserEntity | undefined> {
    return await this.userService.getUserByLogin(login);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcryptCompare(password, hash);
  }

  async verifyToken(token: string, secret: string): Promise<boolean> {
    return authenticator.check(token, secret);
  }

  async verifyToptReset(user: UserEntity, tokenReset: string): Promise<boolean> {
    return user.toptReset === tokenReset;
  }
}
