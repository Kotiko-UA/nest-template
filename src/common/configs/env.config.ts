import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

const db = registerAs('db', () => ({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  name: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
}));

const jwt = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_SECRET_ACCESS,
  accessSecretTTL: process.env.JWT_SECRET_ACCESS_TTL,
  refreshSecret: process.env.JWT_SECRET_REFRESH,
  refreshTTL: process.env.JWT_SECRET_REFRESH_TTL,
}));
const data = registerAs('data', () => ({
  front_end_url: process.env.FRONT_END_URL,
  base_url: process.env.BASE_HOST,
}));

const smtp = registerAs('smtp', () => ({
  name: process.env.SMTP_NAME,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  smtpLogin: process.env.SMTP_LOGIN,
  smtpPass: process.env.SMTP_PASS,
}));

export default {
  envFilePath: `.env`,
  validationSchema: Joi.object({
    FRONT_END_URL: Joi.string().required(),
    BASE_HOST: Joi.string().required(),
    DB_HOST: Joi.string().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    DB_TYPE: Joi.string().required(),
    JWT_SECRET_ACCESS: Joi.string().required(),
    JWT_SECRET_ACCESS_TTL: Joi.string().required(),
    JWT_SECRET_REFRESH: Joi.string().required(),
    JWT_SECRET_REFRESH_TTL: Joi.string().required(),
    SMTP_NAME: Joi.string().required(),
    SMTP_PORT: Joi.number().required(),
    SMTP_SECURE: Joi.boolean().required(),
    SMTP_LOGIN: Joi.string().required(),
    SMTP_PASS: Joi.string().required(),
  }),
  load: [db, jwt, data, smtp],
  isGlobal: true,
};
