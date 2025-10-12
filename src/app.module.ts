import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SharedModule } from './shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { FormModule } from './form/form.module';
import dbConfig from './common/configs/postgres.config';
import envConfig from './common/configs/env.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(dbConfig),
    ConfigModule.forRoot(envConfig),
    AuthModule,
    UsersModule,
    SharedModule,
    FormModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
