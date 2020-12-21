import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { ForceGuardModule } from './forceGuard/forceGuard.module';
import { CredentialModule } from './credential/credential.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_DB_TESTS: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.number().required(),
        BAN_TIME: Joi.number().required(),
        INVALID_ACTIONS_TIME: Joi.number().required(),
      }),
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    TokenModule,
    ForceGuardModule,
    CredentialModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
