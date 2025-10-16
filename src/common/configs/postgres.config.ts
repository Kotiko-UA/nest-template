import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Entities from '../../../db/entities';

export default {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const url = config.get<string>('DB_URL');

    const base: Partial<TypeOrmModuleOptions> = {
      type: 'postgres',
      entities: Object.values(Entities),
      synchronize: false,
      logging: ['error'],
    };

    if (url && url.trim().length > 0) {
      return {
        ...base,
        url,
      } as TypeOrmModuleOptions;
    }
    return {
      ...base,
      host: config.get<string>('DB_HOST'),
      port: Number(config.get<string>('DB_PORT')),
      username: config.get<string>('DB_USERNAME'),
      password: config.get<string>('DB_PASSWORD'),
      database: config.get<string>('DB_NAME'),
    } as TypeOrmModuleOptions;
  },
};
