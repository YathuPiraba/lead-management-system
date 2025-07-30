import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { ConfigService } from '@nestjs/config';
import './config/env.config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logFormat =
    process.env.NODE_ENV?.trim() === 'production' ? 'combined' : 'dev';

  // Middleware
  app.use(cookieParser());
  app.use(helmet());
  app.use(morgan(logFormat));
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      exposedHeaders: ['Authorization'],
    }),
  );

  // Global Configs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // Config values
  const port = configService.get<number>('app.port') ?? 3000;
  const apiPrefix = configService.get<string>('app.prefix') ?? 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  const nodeEnv = process.env.NODE_ENV || 'development';

  if (nodeEnv?.trim() === 'production') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API endpoints and schema')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  await app.listen(port);
}
bootstrap();
