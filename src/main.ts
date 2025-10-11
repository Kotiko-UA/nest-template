import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { ResponseInterseptor } from './common/interseptors/response.interseptor';
import { ValidationPipe } from './common/pipe/pipe';
import { json } from 'express';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import fmp from '@fastify/multipart';
import dotend from 'dotenv';
dotend.config();

async function bootstrap() {
  const logger = new Logger();
  const fastifyAdapter = new FastifyAdapter();
  fastifyAdapter.register(fmp, {
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 10000000, // Max field value size in bytes
      fields: 20, // Max number of non-file fields
      files: 2, // Max number of file fields
      headerPairs: 2000, // Max number of header key=>value pairs
    },
  });

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterseptor());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.use(json({ limit: '100mb' }));
  await app.listen(process.env.API_PORT ?? 3000, () => {
    logger.log(
      'Api started on port: ' + process.env.API_PORT
        ? process.env.API_PORT
        : 3000,
    );
  });
}
bootstrap();
