import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, VersioningType, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require('compression') as typeof import('compression');
import { AppModule } from './app.module';
import { initTracing } from '@infrastructure/observability/tracing';

initTracing();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  app.enableShutdownHooks();
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    credentials: true,
  });

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const isSwaggerEnabled =
    configService.get<string>('SWAGGER_ENABLED', 'false') === 'true';

  if (isSwaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Enterprise API v1')
      .setDescription(
        'Clean Architecture RBAC API — JWT auth, users, roles, permissions.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = configService.get<number>('APP_PORT', 3000);
  await app.listen(port);
  logger.log(
    `Application running on http://localhost:${port}/api/v1`,
    'Bootstrap',
  );
  if (isSwaggerEnabled) {
    logger.log(`Swagger docs: http://localhost:${port}/docs`, 'Bootstrap');
  }
}

void bootstrap();
