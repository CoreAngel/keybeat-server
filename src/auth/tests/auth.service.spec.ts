import { Test } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { inputRegisterUser, userEntity } from '../../utils/user.mock';
import { HttpException, HttpStatus } from '@nestjs/common';
import { hashSync } from 'bcrypt';
import { authenticator } from 'otplib';
import { userServiceMock } from '../../utils/userService.mock';

describe('AuthService', () => {
  let authService: AuthService;

  const hashPassword = 'hashedSecretPassword';
  const generateToptKeys = {
    toptSecret: 'toptSecret',
    toptReset: 'toptReset',
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    }).compile();
    authService = await module.get(AuthService);
  });

  describe('Register', () => {
    it('should register and return user', async () => {
      jest.spyOn(authService, 'hashPassword').mockResolvedValue(hashPassword);
      jest.spyOn(authService, 'generateToptKeys').mockResolvedValue(generateToptKeys);

      userServiceMock.getUserByLogin.mockResolvedValue(undefined);
      const mockUserEntity = userEntity(hashPassword, generateToptKeys);
      userServiceMock.create.mockResolvedValue(mockUserEntity);
      const result = await authService.register(inputRegisterUser);
      expect(result).toMatchObject({
        ...mockUserEntity,
        password: undefined,
      });
    });

    it('should throw error about login exist', async () => {
      userServiceMock.getUserByLogin.mockResolvedValue({
        ...inputRegisterUser,
      });
      await expect(authService.register(inputRegisterUser)).rejects.toEqual(
        new HttpException('User with that email already exists', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('ResetPassword', () => {
    it('should change password', async () => {
      jest.spyOn(authService, 'hashPassword').mockResolvedValue('hashedNewPassword');
      userServiceMock.updatePassword.mockResolvedValue(true);
      const mockUserEntity = userEntity(hashPassword, generateToptKeys);
      const result = await authService.resetPassword(mockUserEntity, 'newPassword', 'newSalt');
      expect(result).toBe(true);
    });
  });

  describe('ResetTopt', () => {
    it('should update topt', async () => {
      userServiceMock.updateTopt.mockResolvedValue(true);
      const mockUserEntity = userEntity(hashPassword, generateToptKeys);
      const result = await authService.resetTopt(
        mockUserEntity,
        generateToptKeys.toptSecret,
        generateToptKeys.toptReset,
      );
      expect(result).toBe(true);
    });
  });

  describe('VerifyUser', () => {
    it('should verify user by login', async () => {
      const mockUserEntity = userEntity(hashPassword, generateToptKeys);
      userServiceMock.getUserByLogin.mockResolvedValue(mockUserEntity);
      const result = await authService.verifyUser(mockUserEntity.login);
      expect(result).not.toBeUndefined();
    });
  });

  describe('VerifyPassword', () => {
    it('should password match', async () => {
      const password = 'superSecretPassword';
      const hash = hashSync(password, 0);
      const result = await authService.verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it('should password dont match', async () => {
      const password = 'superSecretPassword';
      const otherPassword = 'superSecretPassword2';
      const hash = hashSync(password, 0);
      const result = await authService.verifyPassword(otherPassword, hash);
      expect(result).toBe(false);
    });
  });

  describe('VerifyToken', () => {
    it('should token match', async () => {
      const secret = authenticator.generateSecret(20);
      const token = authenticator.generate(secret);
      const result = await authService.verifyToken(token, secret);
      expect(result).toBe(true);
    });

    it('should token dont match', async () => {
      const secret = authenticator.generateSecret(20);
      const token = authenticator.generate(secret);

      const newToken = (parseInt(token.slice(0, 2)) + 10).toString().slice(0, 2) + token.slice(2);
      const result = await authService.verifyToken(newToken, secret);
      expect(result).toBe(false);
    });
  });

  describe('VerifyTopt', () => {
    it('should topt reset match', async () => {
      const mockUserEntity = userEntity(hashPassword, generateToptKeys);
      const result = await authService.verifyToptReset(mockUserEntity, generateToptKeys.toptReset);
      expect(result).toBe(true);
    });

    it('should topt reset dont match', async () => {
      const mockUserEntity = userEntity(hashPassword, generateToptKeys);
      const otherToptReset = `${generateToptKeys.toptReset}Other`;
      const result = await authService.verifyToptReset(mockUserEntity, otherToptReset);
      expect(result).toBe(false);
    });
  });

  describe('CrateUri', () => {
    it('should generate valid uri', async () => {
      const name = 'login';
      const service = 'service';
      const secret = 'secretKey';
      const result = await authService.crateUri(name, service, secret);
      expect(result).toBe(
        `otpauth://totp/${service}:${name}?secret=${secret}&period=30&digits=6&algorithm=SHA1&issuer=${service}`,
      );
    });
  });

  describe('Generate keys', () => {
    describe('GenerateToptKeys', () => {
      it('should generate 2 keys', async () => {
        const result = await authService.generateToptKeys();
        expect(typeof result.toptSecret).toBe('string');
        expect(result.toptSecret).toHaveLength(16);
        expect(typeof result.toptReset).toBe('string');
        expect(result.toptReset).toHaveLength(48);
      });
    });
  });
});
