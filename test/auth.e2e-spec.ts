import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { bootstrap } from './utils/bootstrap';
import { UserService } from '../src/user/user.service';
import { AuthService } from '../src/auth/auth.service';
import { LoginDto } from '../src/auth/dto/loginDto';
import { TokenService } from '../src/token/token.service';
import { authenticator } from 'otplib';
import { loginDto, registerDto, userEntity } from './utils/mocks';

describe('Auth Controller', () => {
  let app: INestApplication;
  let server;
  let userService: UserService;
  let tokenService: TokenService;
  let authService: AuthService;

  beforeEach(async () => {
    app = await bootstrap();
    await app.init();

    server = app.getHttpServer();
    userService = app.get(UserService);
    tokenService = app.get(TokenService);
    authService = app.get(AuthService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Register', () => {
    it('should register new account', async () => {
      const startTime = Date.now();
      const { body } = await request(server).post('/auth/register/').send(registerDto).expect(201);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
      expect(body.uri.length).toBeGreaterThan(0);
      expect(body.secret.length).toBe(16);
      expect(body.reset.length).toBeGreaterThan(0);
    });

    it('should throw duplicate user error', async () => {
      await userService.create(userEntity);

      const startTime = Date.now();
      await request(server).post('/auth/register/').send(registerDto).expect(400);
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should throw validation error', async () => {
      const startTime = Date.now();
      await request(server)
        .post('/auth/register')
        .send({
          ...registerDto,
          name: undefined,
        })
        .expect(400);
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Login', () => {
    it('should login to account', async () => {
      await userService.create(userEntity);
      const token = authenticator.generate(userEntity.toptSecret);

      const loginDto: LoginDto = {
        login: 'login',
        password: 'secretPassword',
        token,
      };

      const startTime = Date.now();
      const { body } = await request(server).post('/auth/login').send(loginDto).expect(200);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
      expect(body.auth.length).toBeGreaterThan(0);
    });

    it('should throw login dont exist', async () => {
      const startTime = Date.now();
      await request(server).post('/auth/login').send(loginDto).expect(401);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should throw password dont match', async () => {
      await userService.create(userEntity);

      const startTime = Date.now();
      await request(server)
        .post('/auth/login')
        .send({
          ...loginDto,
          password: 'secretPassword2',
        })
        .expect(401);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should throw token invalid', async () => {
      await userService.create(userEntity);
      const token = loginDto.token;
      const invalidToken = (parseInt(token.slice(0, 2)) + 10).toString().slice(0, 2) + token.slice(2);

      const startTime = Date.now();
      await request(server)
        .post('/auth/login')
        .send({
          ...loginDto,
          token: invalidToken,
        })
        .expect(401);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Logout', () => {
    it('should account logout', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

      const startTime = Date.now();
      await request(server)
        .post('/auth/logout')
        .send({
          auth: tokenEntity.token,
        })
        .expect(200);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Reset Password', () => {
    it('should reset password', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

      const startTime = Date.now();
      await request(server)
        .patch('/auth/reset/password')
        .send({
          auth: tokenEntity.token,
          password: loginDto.password,
          newPassword: 'newPassword',
          salt: 'salt',
        })
        .expect(200);
      const endTime = Date.now();

      const userFounder = await userService.getUserById(user.id);
      expect(endTime - startTime).toBeLessThan(2000);
      await expect(authService.verifyPassword('newPassword', userFounder.password)).resolves.not.toThrow();
    });

    it('should throw error cuz wrong password', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

      const startTime = Date.now();
      await request(server)
        .patch('/auth/reset/password')
        .send({
          auth: tokenEntity.token,
          password: 'incorrectPassword',
          newPassword: 'newPassword',
          salt: 'salt',
        })
        .expect(401);
      const endTime = Date.now();

      const userFounder = await userService.getUserById(user.id);
      expect(endTime - startTime).toBeLessThan(2000);
      await expect(authService.verifyPassword('newPassword', userFounder.password)).resolves.not.toThrow();
    });
  });

  describe('Reset 2FA', () => {
    it('should reset 2fa', async () => {
      const user = await userService.create(userEntity);

      const startTime = Date.now();
      const { body } = await request(server)
        .patch('/auth/reset/2fa')
        .send({
          login: user.login,
          resetToken: user.toptReset,
        })
        .expect(200);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
      expect(body.uri.length).toBeGreaterThan(0);
      expect(body.secret.length).toBe(16);
      expect(body.reset.length).toBeGreaterThan(0);
    });

    it('should throw error cuz login', async () => {
      const user = await userService.create(userEntity);

      const startTime = Date.now();
      await request(server)
        .patch('/auth/reset/2fa')
        .send({
          login: 'login2',
          resetToken: user.toptReset,
        })
        .expect(401);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should throw error cuz login', async () => {
      const user = await userService.create(userEntity);

      const startTime = Date.now();
      await request(server)
        .patch('/auth/reset/2fa')
        .send({
          login: user.login,
          resetToken: 'invalidToken',
        })
        .expect(401);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});
