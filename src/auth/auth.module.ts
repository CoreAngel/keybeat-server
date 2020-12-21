import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import JwtGuard from './jwt.guard';
import { ConfigService } from '@nestjs/config';
import { ForceGuardModule } from '../forceGuard/forceGuard.module';

@Module({
  imports: [UserModule, TokenModule, ForceGuardModule],
  controllers: [AuthController],
  providers: [ConfigService, AuthService, JwtStrategy, JwtGuard],
  exports: [JwtGuard, AuthService],
})
export class AuthModule {}
