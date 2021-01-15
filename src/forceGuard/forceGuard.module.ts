import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvalidActionEntity } from './invalidAction.entity';
import { BanEntity } from './ban.entity';
import { ForceGuardService } from './forceGuard.service';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UnauthorizedExceptionInterceptor } from './unauthorizedException.interceptor';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([InvalidActionEntity, BanEntity])],
  providers: [
    ForceGuardService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UnauthorizedExceptionInterceptor,
    },
  ],
  exports: [ForceGuardService],
})
export class ForceGuardModule {}
