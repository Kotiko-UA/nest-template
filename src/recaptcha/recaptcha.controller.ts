import { Controller } from '@nestjs/common';
import { RecaptchaService } from './recaptcha.service';

@Controller('recaptcha')
export class RecaptchaController {
  constructor(private readonly recaptchaService: RecaptchaService) {}
}
