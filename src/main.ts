import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { ResponseInterseptor } from './common/interseptors/response.interseptor';
import { ValidationPipe } from './common/pipe/pipe';
import { json } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule); // БЕЗ FastifyAdapter

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterseptor());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.use(json({ limit: '100mb' }));

  const port = Number(process.env.API_PORT ?? 3000);
  await app.listen(port);
  logger.log('Api started on port: ' + port);
}
bootstrap();
