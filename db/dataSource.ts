import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as Entities from './entities';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export default new DataSource({
  type: 'postgres',
  url:
    process.env.DB_URL && process.env.DB_URL.trim().length > 0
      ? process.env.DB_URL
      : undefined,
  host:
    !process.env.DB_URL || process.env.DB_URL.trim().length === 0
      ? process.env.DB_HOST
      : undefined,
  port:
    !process.env.DB_URL || process.env.DB_URL.trim().length === 0
      ? Number(process.env.DB_PORT)
      : undefined,
  username:
    !process.env.DB_URL || process.env.DB_URL.trim().length === 0
      ? process.env.DB_USERNAME
      : undefined,
  password:
    !process.env.DB_URL || process.env.DB_URL.trim().length === 0
      ? process.env.DB_PASSWORD
      : undefined,
  database:
    !process.env.DB_URL || process.env.DB_URL.trim().length === 0
      ? process.env.DB_NAME
      : undefined,
  entities: Object.values(Entities),
  migrations: ['./db/migrations/*.ts'],
  synchronize: false,
});
