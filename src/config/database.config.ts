import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('env.NODE_ENV')
  const dbSsl = configService.get<boolean>('env.DB_SSL')

  return {
    type: 'postgres',
    host: configService.get<string>('env.DB_HOST'),
    port: configService.get<number>('env.DB_PORT'),
    username: configService.get<string>('env.DB_USERNAME'),
    password: configService.get<string>('env.DB_PASSWORD'),
    database: configService.get<string>('env.DB_NAME'),
    ssl: dbSsl ? { rejectUnauthorized: false } : undefined,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: nodeEnv === 'development',
    logging: nodeEnv === 'development',
    migrationsRun: nodeEnv === 'production',
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  }
}
