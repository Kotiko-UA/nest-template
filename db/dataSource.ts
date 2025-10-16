import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as Entities from './entities';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const entities = Object.values(Entities);

const AppDataSource = new DataSource({
  type: 'postgres',
  // host: process.env.DB_HOST, // - якщо звичайний білд
  // port: Number(process.env.DB_PORT), // - якщо звичайний білд
  // username: process.env.DB_USERNAME, // - якщо звичайний білд
  // password: process.env.DB_PASSWORD, // - якщо звичайний білд
  // database: process.env.DB_NAME, // - якщо звичайний білд
  url: process.env.DB_HOST, // - для Railway замість того, що зверху
  entities,
  migrations: ['db/migrations/*.ts'],
  synchronize: false,
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch(err => {
    console.error('Error during Data Source initialization', err);
  });

export default AppDataSource;
