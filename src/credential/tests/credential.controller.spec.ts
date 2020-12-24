import { Test } from '@nestjs/testing';
import { userEntityMock } from '../../utils/user.mock';
import { CredentialController } from '../credential.controller';
import { CredentialService } from '../credential.service';
import { credentialServiceMock } from '../../utils/credentialService.mock';
import { userServiceMock } from '../../utils/userService.mock';
import { AddCredentialArrayDto } from '../dto/addCredentialDto';
import { UserService } from '../../user/user.service';
import { UpdateCredentialArrayDto } from '../dto/updateCredentialDto';
import { DeleteCredentialArrayDto } from '../dto/deleteCredentialDto';
import { SynchronizeCredentialDto } from '../dto/synchronizeCredentialDto';

describe('CredentialController', () => {
  let credentialController: CredentialController;

  const credentialEntity = {
    id: 'qwerty',
    userId: 1,
    iv: 'iv',
    data: 'data',
    lastModified: new Date(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [CredentialController],
      providers: [
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: CredentialService,
          useValue: credentialServiceMock,
        },
      ],
    }).compile();
    credentialController = await module.get(CredentialController);
  });

  describe('addCredential', () => {
    it('should add credential and return mapped ids', async () => {
      const mappedAddedEntity = {
        id: 1,
        uuid: 'qwerty',
      };
      credentialServiceMock.addCredentials.mockResolvedValue([mappedAddedEntity]);
      userServiceMock.updateModificationDate.mockImplementation(() => null);
      const items: AddCredentialArrayDto = {
        items: [{ id: 1, iv: 'iv', data: 'data' }],
      };
      const result = await credentialController.addCredential(userEntityMock, items);
      expect(result).toMatchObject({ items: [mappedAddedEntity] });
    });
  });

  describe('updateCredential', () => {
    it('should update credential', async () => {
      credentialServiceMock.updateCredentials.mockResolvedValue(undefined);
      userServiceMock.updateModificationDate.mockImplementation(() => null);
      const items: UpdateCredentialArrayDto = {
        items: [{ id: 'qwerty', iv: 'iv', data: 'data' }],
      };
      await expect(credentialController.updateCredential(userEntityMock, items)).resolves.not.toThrow();
    });
  });

  describe('deleteCredential', () => {
    it('should delete credential', async () => {
      credentialServiceMock.deleteCredentials.mockResolvedValue(undefined);
      userServiceMock.updateModificationDate.mockImplementation(() => null);
      const items: DeleteCredentialArrayDto = {
        items: [{ id: 'qwerty' }],
      };
      await expect(credentialController.deleteCredential(userEntityMock, items)).resolves.not.toThrow();
    });
  });

  describe('synchronizeCredential', () => {
    it('should not find any modified items, return new date and empty arrays', async () => {
      const synchroDto: SynchronizeCredentialDto = {
        ids: ['qwerty', 'qwerty2'],
        lastSynchronizedDate: Date.now(),
      };
      const result = await credentialController.synchronizeCredential(
        {
          ...userEntityMock,
          lastModified: new Date(),
        },
        synchroDto,
      );
      expect(typeof result.date).toBe('number');
      expect(result.deleted).toHaveLength(0);
      expect(result.modified).toHaveLength(0);
    });

    it('should find modified items, return new date and modified array', async () => {
      credentialServiceMock.findModifiedCredentials.mockResolvedValue([credentialEntity]);
      credentialServiceMock.checkCredentialsExists.mockResolvedValue([]);
      const synchroDto: SynchronizeCredentialDto = {
        ids: ['qwerty', 'qwerty2'],
        lastSynchronizedDate: Date.now() - 1000000,
      };
      const result = await credentialController.synchronizeCredential(
        {
          ...userEntityMock,
          lastModified: new Date(),
        },
        synchroDto,
      );
      expect(typeof result.date).toBe('number');
      expect(result.modified).toHaveLength(1);
      expect(result.modified[0]).toMatchObject({
        id: credentialEntity.id,
        iv: credentialEntity.iv,
        data: credentialEntity.data,
      });
      expect(result.deleted).toHaveLength(0);
    });

    it('should find deleted items, return new date and deleted items array', async () => {
      credentialServiceMock.findModifiedCredentials.mockResolvedValue([]);
      credentialServiceMock.checkCredentialsExists.mockResolvedValue(['qwerty']);
      const synchroDto: SynchronizeCredentialDto = {
        ids: ['qwerty', 'qwerty2'],
        lastSynchronizedDate: Date.now() - 1000000,
      };
      const result = await credentialController.synchronizeCredential(
        {
          ...userEntityMock,
          lastModified: new Date(),
        },
        synchroDto,
      );
      expect(typeof result.date).toBe('number');
      expect(result.modified).toHaveLength(0);
      expect(result.deleted).toHaveLength(1);
      expect(result.deleted[0]).toBe('qwerty');
    });
  });
});
