import { Test } from '@nestjs/testing';
import { UserService } from '../user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user.entity';
import { userRepositoryMock } from '../../utils/userRepository.mock';
import { userEntityMock } from '../../utils/user.mock';

describe('UserService', () => {
  let userService: UserService;


  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: userRepositoryMock,
        },
      ],
    }).compile();
    userService = await module.get(UserService);
  });

  describe('getUserById', () => {
    it('should return user', async () => {
      userRepositoryMock.findOne.mockReturnValue(userEntityMock);
      const result = await userService.getUserById(userEntityMock.id);
      expect(result).toMatchObject(userEntityMock);
    });

    it('should return undefined', async () => {
      userRepositoryMock.findOne.mockReturnValue(undefined);
      const result = await userService.getUserById(userEntityMock.id);
      expect(typeof result).toBe('undefined');
    });
  });

  describe('getUserByLogin', () => {
    it('should return user', async () => {
      userRepositoryMock.findOne.mockReturnValue(userEntityMock);
      const result = await userService.getUserById(userEntityMock.login);
      expect(result).toMatchObject(userEntityMock);
    });

    it('should return undefined', async () => {
      userRepositoryMock.findOne.mockReturnValue(undefined);
      const result = await userService.getUserById(userEntityMock.login);
      expect(typeof result).toBe('undefined');
    });
  });

  describe('create', () => {
    it('should return user', async () => {
      userRepositoryMock.create.mockReturnValue(userEntityMock);
      userRepositoryMock.save.mockReturnValue(userEntityMock);
      const result = await userService.create(userEntityMock);
      expect(result).toMatchObject(userEntityMock);
    });
  });

  describe('updatePassword', () => {
    it('should update password', async () => {
      userRepositoryMock.update.mockReturnValue({ affected: 1 });
      const result = await userService.updatePassword(userEntityMock);
      expect(result).toBe(true);
    });

    it('should not update password', async () => {
      userRepositoryMock.update.mockReturnValue({ affected: 0 });
      const result = await userService.updatePassword(userEntityMock);
      expect(result).toBe(false);
    });
  });

  describe('updateTopt', () => {
    it('should update topt', async () => {
      userRepositoryMock.update.mockReturnValue({ affected: 1 });
      const result = await userService.updateTopt(userEntityMock);
      expect(result).toBe(true);
    });

    it('should not update topt', async () => {
      userRepositoryMock.update.mockReturnValue({ affected: 0 });
      const result = await userService.updateTopt(userEntityMock);
      expect(result).toBe(false);
    });
  });

  describe('updateModificationDate', () => {
    it('should update modification date', async () => {
      userRepositoryMock.update.mockReturnValue({ affected: 1 });
      const result = await userService.updateModificationDate(userEntityMock, new Date());
      expect(result).toBe(true);
    });

    it('should not update modification date', async () => {
      userRepositoryMock.update.mockReturnValue({ affected: 0 });
      const result = await userService.updateModificationDate(userEntityMock, new Date());
      expect(result).toBe(false);
    });
  });
});
