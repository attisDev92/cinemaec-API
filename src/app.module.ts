import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from './modules/users/users.module'
import { EmailsModule } from './modules/emails/emails.module'
import { ProfilesModule } from './modules/profiles/profiles.module'
import { AssetsModule } from './modules/assets/assets.module'
import { SpacesModule } from './modules/spaces/spaces.module'
import { ContractsModule } from './modules/contracts/contracts.module'

import envConfig from './config/env.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      expandVariables: true,
      load: [envConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('env.DB_HOST'),
        port: configService.get('env.DB_PORT'),
        username: configService.get('env.DB_USERNAME'),
        password: configService.get('env.DB_PASSWORD'),
        database: configService.get('env.DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('env.NODE_ENV') === 'development',
        logging: configService.get('env.NODE_ENV') === 'development',
      }),
    }),
    UsersModule,
    EmailsModule,
    ProfilesModule,
    AssetsModule,
    SpacesModule,
    ContractsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
