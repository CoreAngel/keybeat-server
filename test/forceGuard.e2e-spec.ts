import { INestApplication } from '@nestjs/common';
import { bootstrap } from './utils/bootstrap';
import * as request from 'supertest';
import { loginDto, userEntity } from './utils/mocks';
import { authenticator } from 'otplib';
import { LoginDto } from '../src/auth/dto/loginDto';
import { ForceGuardService } from '../src/forceGuard/forceGuard.service';
import { ActionType } from '../src/forceGuard/actionType.enum';
import { TokenService } from '../src/token/token.service';
import { UserService } from '../src/user/user.service';

describe('Jwt Guard', () => {
  let app: INestApplication;
  let server;
  let forceGuardService: ForceGuardService;
  let tokenService: TokenService;
  let userService: UserService;

  beforeEach(async () => {
    app = await bootstrap();
    await app.init();

    server = app.getHttpServer();
    forceGuardService = app.get(ForceGuardService);
    tokenService = app.get(TokenService);
    userService = app.get(UserService);
  });

  afterEach(async () => {
    await app.close();
  });

  const ip = '::ffff:127.0.0.1';

  it('should ban login route', async () => {
    const token = authenticator.generate(userEntity.toptSecret);
    for (let i = 0; i < 15; i++) {
      await forceGuardService.addActionWithBanCheck(ip, ActionType.LOGIN, 15);
    }
    const loginDto: LoginDto = {
      login: 'login',
      password: 'secretPassword',
      token,
    };

    const startTime = Date.now();
    const { body } = await request(server).post('/auth/login').send(loginDto).expect(401);
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(2000);
    expect(body.message).toBe('Your ip is banned');
  });

  it('should ban reset password route', async () => {
    for (let i = 0; i < 3; i++) {
      await forceGuardService.addActionWithBanCheck(ip, ActionType.RESET_PASSWORD, 3);
    }

    const user = await userService.create(userEntity);
    const token = await tokenService.createToken(user);
    const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

    const startTime = Date.now();
    const { body } = await request(server)
      .patch('/auth/reset/password')
      .send({
        auth: tokenEntity.token,
        password: loginDto.password,
        newPassword: 'newPassword',
        salt: 'salt',
      })
      .expect(401);
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(2000);
    expect(body.message).toBe('Your ip is banned');
  });

  it('should ban reset 2fa route', async () => {
    for (let i = 0; i < 3; i++) {
      await forceGuardService.addActionWithBanCheck(ip, ActionType.RESET_2FA, 3);
    }

    const startTime = Date.now();
    const { body } = await request(server)
      .patch('/auth/reset/2fa')
      .send({
        login: userEntity.login,
        resetToken: userEntity.toptReset,
      })
      .expect(401);
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(2000);
    expect(body.message).toBe('Your ip is banned');
  });

  it('should ban jwt guard route', async () => {
    for (let i = 0; i < 100; i++) {
      await forceGuardService.addActionWithBanCheck(ip, ActionType.JWT, 100);
    }

    const user = await userService.create(userEntity);
    const token = await tokenService.createToken(user);
    const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

    const startTime = Date.now();
    const { body } = await request(server)
      .patch('/auth/reset/password')
      .send({
        auth: tokenEntity.token,
        password: loginDto.password,
        newPassword: 'newPassword',
        salt: 'salt',
      })
      .expect(401);
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(2000);
    expect(body.message).toBe('Your ip is banned');
  });
});
