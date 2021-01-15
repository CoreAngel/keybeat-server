import { INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { UserModule } from '../../src/user/user.module';
import { AuthModule } from '../../src/auth/auth.module';
import { TokenModule } from '../../src/token/token.module';
import { ForceGuardModule } from '../../src/forceGuard/forceGuard.module';
import { CredentialModule } from '../../src/credential/credential.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import * as requestIp from 'request-ip';

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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB_TESTS'),
        autoLoadEntities: true,
        synchronize: true,
        dropSchema: true,
      }),
    }),
    UserModule,
    AuthModule,
    TokenModule,
    ForceGuardModule,
    CredentialModule,
  ],
  controllers: [],
  providers: [],
})
export class AppTestModule {}

export const bootstrap = async (): Promise<INestApplication> => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppTestModule],
  }).compile();
  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  app.use(requestIp.mw());
  return app;
};
