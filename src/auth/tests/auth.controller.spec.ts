import { Test } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { authServiceMock } from '../../utils/authService.mock';
import { TokenService } from '../../token/token.service';
import { tokenServiceMock } from '../../utils/tokenService.mock';
import { ForceGuardService } from '../../forceGuard/forceGuard.service';
import { forceGuardServiceMock } from '../../utils/forceGuardService.mock';
import { AuthController } from '../auth.controller';
import { generateToptKeysMock, inputRegisterUser, userEntityMock } from '../../utils/user.mock';
import { UnauthorizedException } from '../../forceGuard/unauthorized.exception';
import { ActionType } from '../../forceGuard/actionType.enum';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: TokenService,
          useValue: tokenServiceMock,
        },
        {
          provide: ForceGuardService,
          useValue: forceGuardServiceMock,
        },
      ],
    }).compile();
    authController = await module.get(AuthController);
  });

  describe('Register', () => {
    it('should register and topt data', async () => {
      const uri = 'otpauth://totp/service:login?secret=secretKey&period=30&digits=6&algorithm=SHA1&issuer=service';
      authServiceMock.register.mockResolvedValue(userEntityMock);
      authServiceMock.crateUri.mockReturnValue(uri);
      const result = await authController.register(inputRegisterUser);
      expect(result).toMatchObject({
        uri,
        secret: userEntityMock.toptSecret,
        reset: `${userEntityMock.login}-${userEntityMock.toptReset}`,
      });
    });
  });

  describe('Login', () => {
    const loginData = {
      login: 'login',
      password: 'password',
      token: '111222',
    };

    it('should throw error cuz invalid user', async () => {
      authServiceMock.verifyUser.mockResolvedValue(undefined);
      await expect(authController.login(loginData, '222.222.222.222')).rejects.toStrictEqual(
        new UnauthorizedException('Wrong credentials provided', ActionType.LOGIN),
      );
    });

    it('should throw error cuz invalid password', async () => {
      authServiceMock.verifyUser.mockResolvedValue(userEntityMock);
      authServiceMock.verifyPassword.mockResolvedValue(false);
      await expect(authController.login(loginData, '222.222.222.222')).rejects.toStrictEqual(
        new UnauthorizedException('Wrong credentials provided', ActionType.LOGIN),
      );
    });

    it('should throw error cuz invalid token', async () => {
      authServiceMock.verifyUser.mockResolvedValue(userEntityMock);
      authServiceMock.verifyPassword.mockResolvedValue(true);
      authServiceMock.verifyToken.mockResolvedValue(false);
      await expect(authController.login(loginData, '222.222.222.222')).rejects.toStrictEqual(
        new UnauthorizedException('Wrong credentials provided', ActionType.LOGIN),
      );
    });

    it('should login and return token', async () => {
      const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjF9.8lSCknTnRANlJ0AVzCgO2yF838WYA7bLaAR7vAKnofo';
      authServiceMock.verifyUser.mockResolvedValue(userEntityMock);
      authServiceMock.verifyPassword.mockResolvedValue(true);
      authServiceMock.verifyToken.mockResolvedValue(true);
      tokenServiceMock.createToken.mockResolvedValue(jwt);
      tokenServiceMock.addToken.mockImplementation(async () => null);
      const result = await authController.login(loginData, '222.222.222.222');
      await expect(result).toMatchObject({
        auth: jwt,
      });
    });
  });

  describe('Logout', () => {
    it('should logout', async () => {
      const tokenEntity = {
        id: 1,
        userId: 1,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjF9.8lSCknTnRANlJ0AVzCgO2yF838WYA7bLaAR7vAKnofo',
        active: true,
        date: new Date(),
        ip: '222.222.222.222',
      };

      tokenServiceMock.cancelToken.mockImplementation(async () => null);
      await expect(authController.logout(tokenEntity)).resolves.not.toThrowError();
    });
  });

  describe('Reset Password', () => {
    const resetPassword = {
      password: 'oldPassword',
      newPassword: 'newPassword',
      salt: 'salt',
    };

    it('should throw error cuz wrong password', async () => {
      authServiceMock.verifyPassword.mockResolvedValue(false);
      await expect(
        authController.resetPassword(userEntityMock, resetPassword, '222.222.222.222'),
      ).rejects.toStrictEqual(new UnauthorizedException('Wrong credentials provided', ActionType.RESET_PASSWORD));
    });

    it('should throw error cuz password not changed', async () => {
      authServiceMock.verifyPassword.mockResolvedValue(true);
      authServiceMock.resetPassword.mockResolvedValue(0);
      await expect(authController.resetPassword(userEntityMock, resetPassword, '222.222.222.222')).rejects.toStrictEqual(
        new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });

    it('should change password', async () => {
      authServiceMock.verifyPassword.mockResolvedValue(true);
      authServiceMock.resetPassword.mockResolvedValue(1);
      await expect(
        authController.resetPassword(userEntityMock, resetPassword, '222.222.222.222'),
      ).resolves.not.toThrowError();
    });
  });

  describe('Reset 2FA', () => {
    const reset2FA = {
      login: 'login',
      resetToken: 'secretResetToken',
    };

    it('should throw error cuz wrong login', async () => {
      authServiceMock.verifyUser.mockResolvedValue(undefined);
      await expect(authController.reset2Fa(reset2FA, '222.222.222.222')).rejects.toStrictEqual(
        new UnauthorizedException('Wrong credentials provided', ActionType.RESET_2FA),
      );
    });

    it('should throw error cuz wrong reset token', async () => {
      authServiceMock.verifyUser.mockResolvedValue(userEntityMock);
      authServiceMock.verifyToptReset.mockResolvedValue(false);
      await expect(authController.reset2Fa(reset2FA, '222.222.222.222')).rejects.toStrictEqual(
        new UnauthorizedException('Wrong credentials provided', ActionType.RESET_2FA),
      );
    });

    it('should throw error cuz wrong token dont changed', async () => {
      authServiceMock.verifyUser.mockResolvedValue(userEntityMock);
      authServiceMock.verifyToptReset.mockResolvedValue(true);
      authServiceMock.generateToptKeys.mockResolvedValue(generateToptKeysMock);
      authServiceMock.resetTopt.mockResolvedValue(false);
      await expect(authController.reset2Fa(reset2FA, '222.222.222.222')).rejects.toStrictEqual(
        new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });

    it('should change 2fa and return data', async () => {
      const uri = 'otpauth://totp/service:login?secret=secretKey&period=30&digits=6&algorithm=SHA1&issuer=service';
      authServiceMock.verifyUser.mockResolvedValue(userEntityMock);
      authServiceMock.verifyToptReset.mockResolvedValue(true);
      authServiceMock.generateToptKeys.mockResolvedValue(generateToptKeysMock);
      authServiceMock.resetTopt.mockResolvedValue(true);
      authServiceMock.crateUri.mockReturnValue(uri);
      const result = await authController.reset2Fa(reset2FA, '222.222.222.222');
      await expect(result).toMatchObject({
        uri,
        secret: generateToptKeysMock.toptSecret,
        reset: `${userEntityMock.login}-${generateToptKeysMock.toptReset}`,
      });
    });
  });
});
