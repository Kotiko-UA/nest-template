import { Module } from '@nestjs/common';
import { R2StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [R2StorageService, ConfigService],
  exports: [R2StorageService],
})
export class StorageModule {}
