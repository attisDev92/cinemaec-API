import { Module } from '@nestjs/common'
import { MailerModule } from '@nestjs-modules/mailer'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EmailsService } from './emails.service'

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('env.MAIL_HOST'),
          port: configService.get<number>('env.MAIL_PORT'),
          secure: false, // true para puerto 465, false para otros puertos
          auth: {
            user: configService.get<string>('env.MAIL_USER'),
            pass: configService.get<string>('env.MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get<string>('env.MAIL_FROM'),
        },
      }),
    }),
  ],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}
