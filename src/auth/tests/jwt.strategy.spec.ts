import { Test } from '@nestjs/testing';
import { UserService } from '../../user/user.service';
import { userEntityMock } from '../../utils/user.mock';
import { Request } from 'express';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { userServiceMock } from '../../utils/userService.mock';
import { TokenService } from '../../token/token.service';
import { configServiceMock } from '../../utils/configService.mock';
import { tokenServiceMock } from '../../utils/tokenService.mock';
import { UnauthorizedException } from '../../forceGuard/unauthorized.exception';
import { ActionType } from '../../forceGuard/actionType.enum';
import { ForceGuardService } from '../../forceGuard/forceGuard.service';
import { forceGuardServiceMock } from '../../utils/forceGuardService.mock';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  const request = {
    body: {
      auth: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjF9.8lSCknTnRANlJ0AVzCgO2yF838WYA7bLaAR7vAKnofo',
    },
    ip: '245.176.56.219',
  } as Request;

  const userEntity = userEntityMock;
  const tokenEntity = {
    id: 1,
    userId: 1,
    ip: request.ip,
    token: request.body.auth,
    active: true,
    date: new Date(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
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
    jwtStrategy = await module.get(JwtStrategy);
  });

  describe('Validate', () => {
    it('should throw unauthorized cuz incorrect user', async () => {
      const payload = {
        userId: 1,
      };
      userServiceMock.getUserById.mockResolvedValue(undefined);
      await expect(jwtStrategy.validate(request, payload)).rejects.toStrictEqual(
        new UnauthorizedException('Wrong credentials provided', ActionType.JWT),
      );
    });

    it('should throw unauthorized cuz not found token', async () => {
      const payload = {
        userId: 1,
      };

      userServiceMock.getUserById.mockResolvedValue(userEntity);
      tokenServiceMock.findToken.mockResolvedValue(undefined);
      await expect(jwtStrategy.validate(request, payload)).rejects.toStrictEqual(
        new UnauthorizedException('Wrong credentials provided', ActionType.JWT),
      );
    });

    it('should throw unauthorized cuz token inactive', async () => {
      const payload = {
        userId: 1,
      };

      userServiceMock.getUserById.mockResolvedValue(userEntity);
      tokenServiceMock.findToken.mockResolvedValue({
        ...tokenEntity,
        active: false,
      });
      await expect(jwtStrategy.validate(request, payload)).rejects.toStrictEqual(
        new UnauthorizedException('Wrong credentials provided', ActionType.JWT),
      );
    });

    it('should throw unauthorized cuz token has different ip', async () => {
      const payload = {
        userId: 1,
      };

      userServiceMock.getUserById.mockResolvedValue(userEntity);
      tokenServiceMock.findToken.mockResolvedValue({
        ...tokenEntity,
        ip: '222.222.222.222',
      });
      await expect(jwtStrategy.validate(request, payload)).rejects.toStrictEqual(
        new UnauthorizedException('Wrong credentials provided', ActionType.JWT),
      );
    });

    it('should authorized and return user and token objects', async () => {
      const payload = {
        userId: 1,
      };

      userServiceMock.getUserById.mockResolvedValue(userEntity);
      tokenServiceMock.findToken.mockResolvedValue(tokenEntity);
      const result = await jwtStrategy.validate(request, payload);

      expect(result.identity).toMatchObject(userEntity);
      expect(result.token).toMatchObject(tokenEntity);
    });
  });
});
