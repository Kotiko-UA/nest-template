import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { ResponseInterseptor } from './common/interseptors/response.interseptor';
import { ValidationPipe } from './common/pipe/pipe';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import fmp from '@fastify/multipart';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const logger = new Logger();
  const fastifyAdapter = new FastifyAdapter();

  fastifyAdapter.register(fmp, {
    limits: {
      fieldNameSize: 100,
      fieldSize: 10000000,
      fields: 20,
      files: 2,
      headerPairs: 2000,
    },
  });

  const app = await NestFactory.create(AppModule, fastifyAdapter);

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterseptor());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  // app.enableCors({ origin: [/^https:\/\/(www\.)?kotiko\.work$/] });

  await app.listen(process.env.API_PORT ?? 3000, '0.0.0.0', () => {
    logger.log('Api started on port: ' + (process.env.API_PORT ?? 3000));
  });
}

bootstrap();
