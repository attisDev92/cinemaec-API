import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe, Logger } from '@nestjs/common'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const port = config.get<number>('PORT') || 3000
  const logger = new Logger('Bootstrap')

  // Logging interceptor global
  app.useGlobalInterceptors(new LoggingInterceptor())

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // CORS configuration
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN') || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  })

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('CinemaEC API')
    .setDescription('Documentación de la API de CinemaEC')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api', app, document)

  await app.listen(port)
  logger.log(
    `🚀 Application is running in ${config.get<string>('NODE_ENV')} mode on: http://localhost:${port}`,
  )
  logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}/api`,
  )
}

void bootstrap()
