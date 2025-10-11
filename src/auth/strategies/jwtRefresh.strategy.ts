import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { UsersRepository } from 'src/common/repositories';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../auth.types';
import { ErrorCodes } from '../../common/statusCodes';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  constructor(
    private readonly authService: AuthService,
    private readonly moduleRef: ModuleRef,
    private usersRepository: UsersRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET_REFRESH,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // We can not get here without token in parameters
    if (await this.usersRepository.getUserById(payload?.id)) {
      return payload;
    }
    throw new ForbiddenException(ErrorCodes.Unauthorized);
  }
}
