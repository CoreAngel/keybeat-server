import { Test } from '@nestjs/testing';
import { CredentialService } from '../credential.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CredentialEntity } from '../credential.entity';
import { credentialRepositoryMock } from '../../utils/credentialsRepository.mock';

describe('CredentialService', () => {
  let credentialService: CredentialService;

  const credentialEntity = {
    id: 'qwerty',
    userId: 1,
    data: 'data',
    lastModified: new Date(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CredentialService,
        {
          provide: getRepositoryToken(CredentialEntity),
          useValue: credentialRepositoryMock,
        },
      ],
    }).compile();
    credentialService = await module.get(CredentialService);
  });

  describe('addCredentials', () => {
    it('should add credentials and return mapped id to uuid', async () => {
      credentialRepositoryMock.create.mockResolvedValue(credentialEntity);
      credentialRepositoryMock.save.mockResolvedValue(credentialEntity);
      const result = await credentialService.addCredentials(
        [
          {
            id: 1,
            data: 'data',
          },
          {
            id: 1,
            data: 'data',
          },
        ],
        1,
        new Date(),
      );
      expect(result).toMatchObject([
        {
          id: 1,
          uuid: 'qwerty',
        },
        {
          id: 1,
          uuid: 'qwerty',
        },
      ]);
    });

    it('should dont add credentials and return empty array', async () => {
      const result = await credentialService.addCredentials([], 1, new Date());
      expect(result).toMatchObject([]);
    });
  });

  describe('updateCredentials', () => {
    it('should update credentials', async () => {
      credentialRepositoryMock.update.mockImplementation(() => null);
      const credentials = [
        {
          id: 'query1',
          data: 'data',
        },
        {
          id: 'query2',
          data: 'data',
        },
      ];
      await expect(credentialService.updateCredentials(credentials, 1, new Date())).resolves.not.toThrow();
    });
  });

  describe('deleteCredentials', () => {
    it('should delete credentials', async () => {
      credentialRepositoryMock.delete.mockImplementation(() => null);
      const credentials = [{ id: 'query1' }, { id: 'query2' }];
      await expect(credentialService.deleteCredentials(credentials, 1)).resolves.not.toThrow();
    });
  });

  describe('findModifiedCredentials', () => {
    it('should find and return credential', async () => {
      credentialRepositoryMock.find.mockResolvedValue(credentialEntity);
      const result = await credentialService.findModifiedCredentials(1, new Date());
      expect(result).toMatchObject(result);
    });
  });

  describe('checkCredentialsExists', () => {
    const checkEntities = [
      {
        ...credentialEntity,
        id: 'uuid1',
      },
      {
        ...credentialEntity,
        id: 'uuid2',
      },
    ];

    it('should return empty ids array', async () => {
      credentialRepositoryMock.find.mockResolvedValue(checkEntities);
      const result = await credentialService.checkCredentialsExists([], 1);
      expect(result).toMatchObject([]);
    });

    it('should return ids not existing in db', async () => {
      credentialRepositoryMock.find.mockResolvedValue(checkEntities);
      const result = await credentialService.checkCredentialsExists(['uuid3', 'uuid2'], 1);
      expect(result).toMatchObject(['uuid3']);
    });
  });
});
