import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { ForceGuardModule } from './forceGuard/forceGuard.module';
import { CredentialModule } from './credential/credential.module';
import { EncryptionModule } from './encryption/encryption.module';
import { EncryptionMiddleware } from './encryption/encryption.middleware';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { EncryptionInterceptor } from './encryption/encryption.interceptor';
import { EncryptionFilter } from './encryption/encryption.filter';

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
        RSA_PRIVATE_KEY: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    TokenModule,
    ForceGuardModule,
    CredentialModule,
    EncryptionModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: EncryptionInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: EncryptionFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EncryptionMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
