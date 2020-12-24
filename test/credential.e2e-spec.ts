import { INestApplication } from '@nestjs/common';
import { bootstrap } from './utils/bootstrap';
import * as request from 'supertest';
import { credentialsEntity, userEntity } from './utils/mocks';
import { TokenService } from '../src/token/token.service';
import { UserService } from '../src/user/user.service';
import { AddCredentialArrayDto } from '../src/credential/dto/addCredentialDto';
import { UpdateCredentialArrayDto } from '../src/credential/dto/updateCredentialDto';
import { CredentialService } from '../src/credential/credential.service';
import { DeleteCredentialArrayDto } from '../src/credential/dto/deleteCredentialDto';
import { SynchronizeCredentialDto } from '../src/credential/dto/synchronizeCredentialDto';

describe('Credential Controller', () => {
  let app: INestApplication;
  let server;
  let tokenService: TokenService;
  let userService: UserService;
  let credentialService: CredentialService;

  beforeEach(async () => {
    app = await bootstrap();
    await app.init();

    server = app.getHttpServer();
    tokenService = app.get(TokenService);
    userService = app.get(UserService);
    credentialService = app.get(CredentialService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Add credential', () => {
    it('should add credentials', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

      const addCredentialArrayDto: AddCredentialArrayDto = {
        items: [
          {
            id: 1,
            iv: 'iv',
            data: 'data',
          },
          {
            id: 2,
            iv: 'iv2',
            data: 'data2',
          },
        ],
      };

      const startTime = Date.now();
      const { body } = await request(server)
        .post('/credential')
        .send({
          auth: tokenEntity.token,
          ...addCredentialArrayDto,
        })
        .expect(201);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
      expect(body.items.length).toBe(2);
    });

    it('should throw validation error', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

      const addCredentialArrayDto: AddCredentialArrayDto = {
        items: [
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          {
            iv: 'iv',
            data: 'data',
          },
          {
            id: 2,
            iv: 'iv2',
            data: 'data2',
          },
        ],
      };

      const startTime = Date.now();
      await request(server)
        .post('/credential')
        .send({
          auth: tokenEntity.token,
          ...addCredentialArrayDto,
        })
        .expect(400);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should work with 0 items', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

      const addCredentialArrayDto: AddCredentialArrayDto = {
        items: [],
      };

      const startTime = Date.now();
      const { body } = await request(server)
        .post('/credential')
        .send({
          auth: tokenEntity.token,
          ...addCredentialArrayDto,
        })
        .expect(201);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
      expect(body.items.length).toBe(0);
    });
  });
  describe('Update credential', () => {
    it('should update credentials', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

      const ids = await credentialService.addCredentials(
        [
          {
            ...credentialsEntity,
            id: 1,
          },
          {
            ...credentialsEntity,
            id: 2,
          },
        ],
        user.id,
        new Date(),
      );

      const updateCredentialArrayDto: UpdateCredentialArrayDto = {
        items: [
          {
            id: ids[0].uuid,
            iv: 'iv',
            data: 'data',
          },
          {
            id: ids[0].uuid,
            iv: 'iv2',
            data: 'data2',
          },
        ],
      };

      const startTime = Date.now();
      await request(server)
        .patch('/credential')
        .send({
          auth: tokenEntity.token,
          ...updateCredentialArrayDto,
        })
        .expect(204);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should throw validation error', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

      const updateCredentialArrayDto: UpdateCredentialArrayDto = {
        items: [
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          {
            iv: 'iv',
            data: 'data',
          },
          {
            id: '2',
            iv: 'iv2',
            data: 'data2',
          },
        ],
      };

      const startTime = Date.now();
      await request(server)
        .patch('/credential')
        .send({
          auth: tokenEntity.token,
          ...updateCredentialArrayDto,
        })
        .expect(400);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should work with 0 items', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

      await credentialService.addCredentials(
        [
          {
            ...credentialsEntity,
            id: 1,
          },
          {
            ...credentialsEntity,
            id: 2,
          },
        ],
        user.id,
        new Date(),
      );

      const updateCredentialArrayDto: UpdateCredentialArrayDto = {
        items: [],
      };

      const startTime = Date.now();
      await request(server)
        .patch('/credential')
        .send({
          auth: tokenEntity.token,
          ...updateCredentialArrayDto,
        })
        .expect(204);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Delete credential', () => {
    it('should delete credentials', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

      const ids = await credentialService.addCredentials(
        [
          {
            ...credentialsEntity,
            id: 1,
          },
          {
            ...credentialsEntity,
            id: 2,
          },
        ],
        user.id,
        new Date(),
      );

      const deleteCredentialArrayDto: DeleteCredentialArrayDto = {
        items: [
          {
            id: ids[0].uuid,
          },
          {
            id: ids[0].uuid,
          },
        ],
      };

      const startTime = Date.now();
      await request(server)
        .delete('/credential')
        .send({
          auth: tokenEntity.token,
          ...deleteCredentialArrayDto,
        })
        .expect(204);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should throw validation error', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

      const updateCredentialArrayDto: DeleteCredentialArrayDto = {
        items: [
          {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            id: 1,
          },
          {
            id: '2',
          },
        ],
      };

      const startTime = Date.now();
      await request(server)
        .delete('/credential')
        .send({
          auth: tokenEntity.token,
          ...updateCredentialArrayDto,
        })
        .expect(400);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should work with 0 items', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

      await credentialService.addCredentials(
        [
          {
            ...credentialsEntity,
            id: 1,
          },
          {
            ...credentialsEntity,
            id: 2,
          },
        ],
        user.id,
        new Date(),
      );

      const deleteCredentialArrayDto: DeleteCredentialArrayDto = {
        items: [],
      };

      const startTime = Date.now();
      await request(server)
        .delete('/credential')
        .send({
          auth: tokenEntity.token,
          ...deleteCredentialArrayDto,
        })
        .expect(204);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Synchronize credential', () => {
    it('should return new timestamp without modified and deleted', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

      const ids = await credentialService.addCredentials(
        [
          {
            ...credentialsEntity,
            id: 1,
          },
          {
            ...credentialsEntity,
            id: 2,
          },
        ],
        user.id,
        new Date(),
      );

      const synchronizeCredentialArrayDto: SynchronizeCredentialDto = {
        lastSynchronizedDate: Date.now() + 100000,
        ids: [ids[0].uuid, ids[1].uuid],
      };

      const startTime = Date.now();
      const { body } = await request(server)
        .post('/credential/sync')
        .send({
          auth: tokenEntity.token,
          ...synchronizeCredentialArrayDto,
        })
        .expect(200);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
      expect(body.date).toBeGreaterThan(0);
      expect(body.modified.length).toBe(0);
      expect(body.deleted.length).toBe(0);
    });

    it('should return new timestamp and modified', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

      const ids = await credentialService.addCredentials(
        [
          {
            ...credentialsEntity,
            id: 1,
          },
          {
            ...credentialsEntity,
            id: 2,
          },
        ],
        user.id,
        new Date(),
      );

      const synchronizeCredentialArrayDto: SynchronizeCredentialDto = {
        lastSynchronizedDate: Date.now() - 100000,
        ids: [ids[0].uuid, ids[1].uuid],
      };

      const startTime = Date.now();
      const { body } = await request(server)
        .post('/credential/sync')
        .send({
          auth: tokenEntity.token,
          ...synchronizeCredentialArrayDto,
        })
        .expect(200);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
      expect(body.date).toBeGreaterThan(0);
      expect(body.modified.length).toBe(2);
      expect(body.deleted.length).toBe(0);
    });

    it('should return new timestamp with modified and deleted', async () => {
      const user = await userService.create(userEntity);
      const token = await tokenService.createToken(user);
      const tokenEntity = await tokenService.addToken(user, '::ffff:127.0.0.1', token);

      const ids = await credentialService.addCredentials(
        [
          {
            ...credentialsEntity,
            id: 1,
          },
          {
            ...credentialsEntity,
            id: 2,
          },
        ],
        user.id,
        new Date(),
      );

      const synchronizeCredentialArrayDto: SynchronizeCredentialDto = {
        lastSynchronizedDate: Date.now() - 100000,
        ids: ['someId'],
      };

      const startTime = Date.now();
      const { body } = await request(server)
        .post('/credential/sync')
        .send({
          auth: tokenEntity.token,
          ...synchronizeCredentialArrayDto,
        })
        .expect(200);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
      expect(body.date).toBeGreaterThan(0);
      expect(body.modified.length).toBe(2);
      expect(body.deleted.length).toBe(1);
    });
  });
});
