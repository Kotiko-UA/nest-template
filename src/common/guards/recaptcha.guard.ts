import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RecaptchaService } from 'src/recaptcha/recaptcha.service';
import { RECAPTCHA_ACTION_KEY } from '../decorators/recaptcha.decorator';
@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(
    private readonly recaptcha: RecaptchaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const token =
      req.headers['x-recaptcha-token'] ||
      req.body?.recaptchaToken || // fallback, якщо все ж у body
      '';

    const expectedAction =
      this.reflector.get<string>(RECAPTCHA_ACTION_KEY, ctx.getHandler()) ||
      (req.headers['x-recaptcha-action'] as string | undefined);

    const remoteIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip;

    const result = await this.recaptcha.verify(
      String(token),
      expectedAction,
      remoteIp,
    );

    if (!result.ok) {
      throw new ForbiddenException({
        message: 'reCAPTCHA verification failed',
        details: {
          score: result.score,
          action: result.action,
          hostname: result.hostname,
          errors: result.errors,
        },
      });
    }
    req.recaptcha = { score: result.score, action: result.action };
    return true;
  }
}
