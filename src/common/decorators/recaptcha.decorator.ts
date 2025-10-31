import { SetMetadata } from '@nestjs/common';
export const RECAPTCHA_ACTION_KEY = 'recaptcha:action';
export const RecaptchaAction = (action: string) =>
  SetMetadata(RECAPTCHA_ACTION_KEY, action);
