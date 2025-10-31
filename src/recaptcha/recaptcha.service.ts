import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

type VerifyResp = {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
};

@Injectable()
export class RecaptchaService {
  private readonly secret: string;
  private readonly minScore: number;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.secret = this.config.get<string>('recaptcha.recaptchaSecretKey', '');
    this.minScore = Number(this.config.get('recaptcha.recaptchaMinScore', 0.5));
    if (!this.secret) {
      throw new BadRequestException('RECAPTCHA_SECRET is not configured');
    }
  }

  async verify(token: string, expectedAction?: string, remoteIp?: string) {
    if (!token) return { ok: false, reason: 'missing-token' as const };

    const params = new URLSearchParams();
    params.set('secret', this.secret);
    params.set('response', token);
    if (remoteIp) params.set('remoteip', remoteIp);

    const { data } = await firstValueFrom(
      this.http.post<VerifyResp>(
        'https://www.google.com/recaptcha/api/siteverify',
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      ),
    );

    const ok =
      data.success === true &&
      (data.score ?? 0) >= this.minScore &&
      (!expectedAction || data.action === expectedAction);

    return {
      ok,
      score: data.score ?? 0,
      action: data.action,
      hostname: data.hostname,
      errors: data['error-codes'],
      reason: ok ? undefined : ('verification-failed' as const),
    };
  }
}
