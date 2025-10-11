import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Services from './services';

const providers = [...Object.values(Services), ConfigService];

@Module({
  imports: [],
  controllers: [],
  providers: [...providers],
  exports: [...providers],
})
export class SharedModule {}
