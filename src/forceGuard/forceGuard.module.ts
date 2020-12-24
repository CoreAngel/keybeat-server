import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvalidActionEntity } from './invalidAction.entity';
import { BanEntity } from './ban.entity';
import { ForceGuardService } from './forceGuard.service';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { UnauthorizedExceptionFilter } from './unauthorizedException.filter';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([InvalidActionEntity, BanEntity])],
  providers: [
    ForceGuardService,
    {
      provide: APP_FILTER,
      useClass: UnauthorizedExceptionFilter,
    },
  ],
  exports: [ForceGuardService],
})
export class ForceGuardModule {}
