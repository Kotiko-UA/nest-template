// src/config/index.ts
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

const db = registerAs('db', () => ({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  name: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  url: process.env.DB_URL ?? '',
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

const resend = registerAs('resend', () => ({
  resendApiKey: process.env.RESEND_API_KEY,
}));

const recaptcha = registerAs('recaptcha', () => ({
  recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
  recaptchaMinScore: process.env.RECAPTCHA_MIN_SCORE,
}));

const r2 = registerAs('r2', () => ({
  r2AccountId: process.env.R2_ACCOUNT_ID,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  r2Bucket: process.env.R2_BUCKET,
  r2PublicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
}));

export default {
  envFilePath: `.env`,
  validationSchema: Joi.object({
    FRONT_END_URL: Joi.string().required(),
    BASE_HOST: Joi.string().required(),
    DB_TYPE: Joi.string().valid('postgres').required(),
    DB_URL: Joi.string()
      .uri({ scheme: ['postgres', 'postgresql'] })
      .allow('', null),
    DB_HOST: Joi.alternatives().conditional('DB_URL', {
      is: Joi.string().min(1),
      then: Joi.string().optional(),
      otherwise: Joi.string().required(),
    }),
    DB_PORT: Joi.alternatives().conditional('DB_URL', {
      is: Joi.string().min(1),
      then: Joi.number().optional(),
      otherwise: Joi.number().required(),
    }),
    DB_USERNAME: Joi.alternatives().conditional('DB_URL', {
      is: Joi.string().min(1),
      then: Joi.string().optional(),
      otherwise: Joi.string().required(),
    }),
    DB_PASSWORD: Joi.alternatives().conditional('DB_URL', {
      is: Joi.string().min(1),
      then: Joi.string().optional(),
      otherwise: Joi.string().required(),
    }),
    DB_NAME: Joi.alternatives().conditional('DB_URL', {
      is: Joi.string().min(1),
      then: Joi.string().optional(),
      otherwise: Joi.string().required(),
    }),

    // JWT
    JWT_SECRET_ACCESS: Joi.string().required(),
    JWT_SECRET_ACCESS_TTL: Joi.string().required(),
    JWT_SECRET_REFRESH: Joi.string().required(),
    JWT_SECRET_REFRESH_TTL: Joi.string().required(),

    // SMTP
    SMTP_NAME: Joi.string(),
    SMTP_PORT: Joi.number(),
    SMTP_SECURE: Joi.boolean(),
    SMTP_LOGIN: Joi.string(),
    SMTP_PASS: Joi.string(),

    // RESEND
    RESEND_API_KEY: Joi.string(),

    // RECAPTCHA
    RECAPTCHA_SECRET_KEY: Joi.string(),
    RECAPTCHA_MIN_SCORE: Joi.string(),

    // R2 cloudflare
    R2_ACCOUNT_ID: Joi.string(),
    R2_ACCESS_KEY_ID: Joi.string(),
    R2_SECRET_ACCESS_KEY: Joi.string(),
    R2_BUCKET: Joi.string(),
    R2_PUBLIC_BASE_URL: Joi.string(),
  }).custom((value, helpers) => {
    const hasUrl = !!(value.DB_URL && String(value.DB_URL).trim());
    const hasParams =
      value.DB_HOST &&
      value.DB_PORT &&
      value.DB_USERNAME &&
      value.DB_PASSWORD &&
      value.DB_NAME;

    if (!hasUrl && !hasParams) {
      return helpers.error('any.custom', {
        message:
          'Provide DB_URL or all of DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME',
      });
    }
    return value;
  }),
  load: [db, jwt, data, smtp, resend, recaptcha, r2],
  isGlobal: true,
};
