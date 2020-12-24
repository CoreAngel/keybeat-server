import { INestApplication } from '@nestjs/common';
import { bootstrap } from './utils/bootstrap';
import * as request from 'supertest';
import { userEntity } from './utils/mocks';
import { TokenService } from '../src/token/token.service';
import { UserService } from '../src/user/user.service';

describe('Jwt Guard', () => {
  let app: INestApplication;
  let server;
  let tokenService: TokenService;
  let userService: UserService;

  beforeEach(async () => {
    app = await bootstrap();
    await app.init();

    server = app.getHttpServer();
    tokenService = app.get(TokenService);
    userService = app.get(UserService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Jwt Guard', () => {
    it('should throw invalid token', async () => {
      const startTime = Date.now();
      await request(server)
        .post('/auth/logout')
        .send({
          auth: 'invalidToken',
        })
        .expect(401);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should throw cuz invalid user not exist', async () => {
      const token = await tokenService.createToken({
        ...userEntity,
        id: 1,
      });
      const tokenEntity = await tokenService.addToken(
        {
          ...userEntity,
          id: 1,
        },
        '::ffff:127.0.0.1',
        token,
      );

      const startTime = Date.now();
      await request(server)
        .post('/auth/logout')
        .send({
          auth: tokenEntity.token,
        })
        .expect(401);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should throw cuz invalid user ip', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.1.1.1', token);

      const startTime = Date.now();
      await request(server)
        .post('/auth/logout')
        .send({
          auth: tokenEntity.token,
        })
        .expect(401);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});
