import { Test } from '@nestjs/testing';
import { TokenService } from '../token.service';
import { UserService } from '../../user/user.service';
import { userServiceMock } from '../../utils/userService.mock';
import { JwtService } from '@nestjs/jwt';
import { jwtServiceMock } from '../../utils/jwt.service.mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TokenEntity } from '../token.entity';
import { tokenRepositoryMock } from '../../utils/tokenRepository.mock';
import { userEntityMock } from '../../utils/user.mock';

describe('TokenService', () => {
  let tokenService: TokenService;

  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjF9.8lSCknTnRANlJ0AVzCgO2yF838WYA7bLaAR7vAKnofo';
  const tokenEntity: TokenEntity = {
    id: 1,
    userId: userEntityMock.id,
    ip: '222.222.222.222',
    token,
    active: true,
    date: new Date(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: getRepositoryToken(TokenEntity),
          useValue: tokenRepositoryMock,
        },
      ],
    }).compile();
    tokenService = await module.get(TokenService);
  });

  describe('createToken', () => {
    it('should return token', async () => {
      jwtServiceMock.sign.mockReturnValue(token);
      const result = await tokenService.createToken(userEntityMock);
      expect(result).toBe(token);
    });
  });

  describe('addToken', () => {
    it('should add token', async () => {
      tokenRepositoryMock.create.mockResolvedValue(tokenEntity);
      tokenRepositoryMock.save.mockResolvedValue(tokenEntity);
      const result = await tokenService.addToken(userEntityMock, tokenEntity.ip, token);
      expect(result).toMatchObject(tokenEntity);
    });
  });

  describe('findToken', () => {
    it('should find token and return', async () => {
      tokenRepositoryMock.findOne.mockResolvedValue(tokenEntity);
      const result = await tokenService.findToken(userEntityMock.id, token);
      expect(result).toMatchObject(tokenEntity);
    });

    it('should not find token', async () => {
      tokenRepositoryMock.findOne.mockResolvedValue(undefined);
      const result = await tokenService.findToken(userEntityMock.id, token);
      expect(typeof result).toBe('undefined');
    });
  });

  describe('cancelToken', () => {
    it('should cancel token', async () => {
      tokenRepositoryMock.update.mockImplementation(() => null);
      await expect(tokenService.cancelToken(tokenEntity)).resolves.not.toThrow();
    });
  });
});
