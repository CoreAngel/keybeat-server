import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvalidActionEntity } from './invalidAction.entity';
import { BanEntity } from './ban.entity';
import { ForceGuardService } from './forceGuard.service';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UnauthorizedExceptionInterceptor } from './unauthorizedException.interceptor';
import ForceGuardGuard from './forceGuard.guard';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([InvalidActionEntity, BanEntity])],
  providers: [
    ForceGuardService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UnauthorizedExceptionInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ForceGuardGuard,
    },
  ],
  exports: [ForceGuardService],
})
export class ForceGuardModule {}
