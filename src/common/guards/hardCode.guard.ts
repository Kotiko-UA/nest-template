import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HardCodeGuard implements CanActivate {
  private hardToken: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.hardToken = this.configService.get('data.hardAccessToken');
  }

  canActivate(context: ExecutionContext): boolean {
    const { accesstoken } = context.switchToHttp().getRequest().headers;
    console.log(accesstoken)
    console.log(this.hardToken)
    return accesstoken && accesstoken === this.hardToken;
  }
}
