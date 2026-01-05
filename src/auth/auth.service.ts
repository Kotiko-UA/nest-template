import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from 'src/common/repositories';
import { ErrorCodes } from 'src/common/statusCodes';
import { promisify } from 'util';
import { GeneratedTokensDto } from './dto/Tokens.dto';
import { IAdmin } from './dto/common';
import { GeneratedTokens, GoogleProfile } from './auth.types';
import { InfoCodes } from 'src/common/statusCodes/infos';
import { UsersService } from 'src/users/users.service';
import { TokenInfo } from 'src/users/users.types';
import {
  BadRequestAppException,
  ForbiddenAppException,
} from 'src/common/exceptions';

@Injectable()
export class AuthService {
  private readonly admins: IAdmin[];

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
  ) {
    this.admins = this.configService.get('config.admins');
  }

  generateTokens(payload): GeneratedTokensDto {
    const refreshToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshTTL'),
    });

    this.usersRepository.update(payload.id, {
      refreshToken,
    });

    return {
      token: this.jwtService.sign(payload, {
        secret: this.configService.get('jwt.accessSecret'),
        expiresIn: this.configService.get('jwt.accessSecretTTL'),
      }),
      refreshToken,
    };
  }

  private getLockDurationMs(lockoutCount: number) {
    const scheduleSeconds = [
      5 * 60, // 1 -> 5 min
      15 * 60, // 2 -> 15 min
      60 * 60, // 3 -> 1 hour
      6 * 60 * 60, // 4 -> 6 hours
      24 * 60 * 60, // 5+ -> 24 hours (cap)
    ];
    const idx = Math.min(
      Math.max(lockoutCount, 1) - 1,
      scheduleSeconds.length - 1,
    );
    return scheduleSeconds[idx] * 1000;
  }

  async validateUser(email: string, password: string): Promise<{ id: number }> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.usersRepository.getUser(normalizedEmail);

    if (!user || !user.password) {
      throw new ForbiddenAppException(ErrorCodes.CredentialsNotValid);
    }
    if (!user.active) {
      throw new BadRequestAppException(ErrorCodes.EmailNotVerified);
    }
    if (user.blocked) {
      throw new ForbiddenAppException(ErrorCodes.NotEnoughPermissions);
    }

    const now = new Date();

    if (
      user.loginLockedUntil &&
      user.loginLockedUntil.getTime() > now.getTime()
    ) {
      throw new ForbiddenAppException(ErrorCodes.TooManyLoginAttempts);
    }

    const ok = await promisify(bcrypt.compare)(password, user.password);

    if (ok) {
      await this.usersRepository.update(
        { id: user.id },
        {
          failedLoginAttempts: 0,
          loginLockedUntil: null,
          loginLockoutCount: 0,
          lastFailedLoginAt: null,
        },
      );

      return { id: user.id };
    }

    const DECAY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h
    const lastFailed = user.lastFailedLoginAt?.getTime() ?? 0;
    const shouldDecay =
      !lastFailed || now.getTime() - lastFailed > DECAY_WINDOW_MS;

    const currentAttempts = shouldDecay ? 0 : (user.failedLoginAttempts ?? 0);
    const currentLockouts = shouldDecay ? 0 : (user.loginLockoutCount ?? 0);

    const nextAttempts = currentAttempts + 1;

    if (nextAttempts >= 3) {
      const nextLockouts = currentLockouts + 1;
      const lockMs = this.getLockDurationMs(nextLockouts);
      const lockedUntil = new Date(now.getTime() + lockMs);

      await this.usersRepository.update(
        { id: user.id },
        {
          failedLoginAttempts: nextAttempts,
          loginLockoutCount: nextLockouts,
          loginLockedUntil: lockedUntil,
          lastFailedLoginAt: now,
        },
      );

      throw new ForbiddenAppException(ErrorCodes.TooManyLoginAttempts);
    }

    await this.usersRepository.update(
      { id: user.id },
      {
        failedLoginAttempts: nextAttempts,
        lastFailedLoginAt: now,
      },
    );

    throw new ForbiddenAppException(ErrorCodes.CredentialsNotValid);
  }

  async executeUserWithToken(user: TokenInfo, social?: boolean) {
    const tokens: GeneratedTokens = this.generateTokens({
      id: user.id,
      roleId: user.role.id,
    });

    const userInfo = await this.usersRepository.getUserInfo(user.id);

    const mappedData = {
      ...userInfo,
      subscriptionExist: false,
    };

    const { active } = userInfo;
    if (active || social) {
      return {
        ...tokens,
        user: mappedData,
      };
    }

    return { code: InfoCodes.NeedVerifyEmail };
  }

  async getGoogleProfileByToken(
    token: string,
    platform: string,
  ): Promise<GoogleProfile | any> {
    try {
      if (platform === 'android') {
        return this.jwtService.decode(token);
      }

      const response = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo?alt=json',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch Google profile: ${response.statusText}`,
        );
      }

      const data: GoogleProfile = await response.json();
      return data;
    } catch (err) {
      throw new BadRequestAppException(ErrorCodes.WrongToken);
    }
  }

  async validateSocialProfile(
    profile: Partial<GoogleProfile>,
    customEmail: string,
  ) {
    const email = customEmail || profile?.email;
    const existingUserWithMail =
      await this.usersRepository.getUserWithRole(email);
    if (existingUserWithMail) {
      return this.executeUserWithToken(existingUserWithMail, true);
    }

    const tempPassword = this.usersService.generateRandomCode(6);
    const newUser = {
      name: profile.name,
      email,
      password: tempPassword,
    };

    const user = await this.usersService.registerUser(newUser, true);
    return this.executeUserWithToken(
      {
        id: user.id,
        role: { id: user.roleId },
      },
      true,
    );
  }
}
