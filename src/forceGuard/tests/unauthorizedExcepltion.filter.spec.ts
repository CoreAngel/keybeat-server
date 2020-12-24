import { Test } from '@nestjs/testing';
import { UnauthorizedExceptionFilter } from '../unauthorizedException.filter';
import { ForceGuardService } from '../forceGuard.service';
import { forceGuardServiceMock } from '../../utils/forceGuardService.mock';
import { UnauthorizedException } from '../unauthorized.exception';
import { ActionType } from '../actionType.enum';
import { ArgumentsHost } from '@nestjs/common';

describe('UnauthorizedExceptionFilter', () => {
  let unauthorizedExceptionFilter: UnauthorizedExceptionFilter;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UnauthorizedExceptionFilter,
        {
          provide: ForceGuardService,
          useValue: forceGuardServiceMock,
        },
      ],
    }).compile();
    unauthorizedExceptionFilter = await module.get(UnauthorizedExceptionFilter);
  });

  describe('catch exception', () => {
    const exMessage = 'Message exception';
    const exception = new UnauthorizedException(exMessage, ActionType.LOGIN);

    const responseCtx = {
      status: (_) => responseCtx,
      json: (body) => body,
    };

    const host = {
      switchToHttp: () => ({
        getResponse: () => responseCtx,
        getRequest: () => ({
          ip: '222.222.222.222',
        }),
      }),
    } as ArgumentsHost;

    it('should return response with message and status', async () => {
      forceGuardServiceMock.addActionWithBanCheck.mockImplementation(() => null);
      const result = await unauthorizedExceptionFilter.catch(exception, host);
      expect(result).toMatchObject({
        statusCode: exception.getStatus(),
        message: exception.message,
      });
    });
  });
});
