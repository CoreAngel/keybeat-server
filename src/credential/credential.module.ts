import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { CredentialEntity } from './credential.entity';
import { AuthModule } from '../auth/auth.module';
import { CredentialService } from './credential.service';
import { CredentialController } from './credential.controller';

@Module({
  imports: [UserModule, AuthModule, TypeOrmModule.forFeature([CredentialEntity])],
  controllers: [CredentialController],
  providers: [CredentialService],
  exports: [],
})
export class CredentialModule {}
