import { Test } from '@nestjs/testing';
import { ForceGuardService } from '../forceGuard.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvalidActionEntity } from '../invalidAction.entity';
import { BanEntity } from '../ban.entity';
import { ConfigService } from '@nestjs/config';
import { configServiceMock } from '../../utils/configService.mock';
import { invalidActionRepositoryMock } from '../../utils/invalidActionRepository.mock';
import { banRepositoryMock } from '../../utils/banRepository.mock';
import { ActionType } from '../actionType.enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import MockedFunction = jest.MockedFunction;

describe('ForceGuard', () => {
  let forceGuardService: ForceGuardService;

  const invalidActionEntity = {
    id: 1,
    ip: '222.222.222.222',
    type: ActionType.LOGIN,
    date: new Date(),
  };

  const banEntity = {
    id: 1,
    ip: '222.222.222.222',
    type: ActionType.LOGIN,
    date: new Date(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ForceGuardService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: getRepositoryToken(InvalidActionEntity),
          useValue: invalidActionRepositoryMock,
        },
        {
          provide: getRepositoryToken(BanEntity),
          useValue: banRepositoryMock,
        },
      ],
    }).compile();
    forceGuardService = await module.get(ForceGuardService);
  });

  describe('addInvalidAction', () => {
    it('should add new invalid action', async () => {
      invalidActionRepositoryMock.create.mockResolvedValue(invalidActionEntity);

      await expect(forceGuardService.addInvalidAction('222.222.222.222', ActionType.LOGIN)).resolves.not.toThrow();
    });
  });

  describe('addBan', () => {
    it('should add new ban', async () => {
      banRepositoryMock.create.mockResolvedValue(invalidActionEntity);

      await expect(forceGuardService.addBan('222.222.222.222', ActionType.LOGIN)).resolves.not.toThrow();
    });
  });

  describe('countInvalidActions', () => {
    it('should return number action in time range', async () => {
      const createQueryBuilder: any = {
        orderBy: () => createQueryBuilder,
        where: () => createQueryBuilder,
        getCount: () => 0,
      };

      banRepositoryMock.create.mockResolvedValue(invalidActionEntity);
      invalidActionRepositoryMock.createQueryBuilder.mockImplementation(() => createQueryBuilder);

      const result = await forceGuardService.countInvalidActions('222.222.222.222', ActionType.LOGIN);
      expect(result).toBe(0);
    });
  });

  describe('checkIsBaned', () => {
    it('should not throw error cuz not find ban in db', async () => {
      const createQueryBuilder: any = {
        orderBy: () => createQueryBuilder,
        where: () => createQueryBuilder,
        getOne: () => undefined,
      };

      banRepositoryMock.createQueryBuilder.mockImplementation(() => createQueryBuilder);

      await expect(forceGuardService.checkIsBaned('222.222.222.222', ActionType.LOGIN)).resolves.not.toThrow();
    });

    it('should not throw error cuz ban is to old', async () => {
      const createQueryBuilder: any = {
        orderBy: () => createQueryBuilder,
        where: () => createQueryBuilder,
        getOne: () => ({
          ...banEntity,
          date: new Date(Date.now() - 2 * (configServiceMock.get('BAN_TIME') as number) * 1000),
        }),
      };

      banRepositoryMock.createQueryBuilder.mockImplementation(() => createQueryBuilder);

      await expect(forceGuardService.checkIsBaned('222.222.222.222', ActionType.LOGIN)).resolves.not.toThrow();
    });

    it('should throw error cuz ip is banned', async () => {
      const createQueryBuilder: any = {
        orderBy: () => createQueryBuilder,
        where: () => createQueryBuilder,
        getOne: () => banEntity,
      };

      banRepositoryMock.createQueryBuilder.mockImplementation(() => createQueryBuilder);

      await expect(forceGuardService.checkIsBaned('222.222.222.222', ActionType.LOGIN)).rejects.toStrictEqual(
        new HttpException('Your ip is banned', HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('addActionWithBanCheck', () => {
    it('should not add ban', async () => {
      jest.spyOn(forceGuardService, 'addInvalidAction').mockImplementation(() => null);
      jest.spyOn(forceGuardService, 'countInvalidActions').mockImplementation(async () => 5);
      jest.spyOn(forceGuardService, 'addBan').mockReset();

      await forceGuardService.addActionWithBanCheck('222.222.222.222', ActionType.LOGIN, 8);
      await expect((forceGuardService.addBan as MockedFunction<any>).mock.calls.length).toBe(0);
    });

    it('should add ban', async () => {
      jest.spyOn(forceGuardService, 'addInvalidAction').mockImplementation(() => null);
      jest.spyOn(forceGuardService, 'countInvalidActions').mockImplementation(async () => 5);
      jest.spyOn(forceGuardService, 'addBan').mockReset();

      await forceGuardService.addActionWithBanCheck('222.222.222.222', ActionType.LOGIN, 4);
      await expect((forceGuardService.addBan as MockedFunction<any>).mock.calls.length).toBe(1);
    });
  });
});
