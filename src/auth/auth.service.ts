import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from 'src/common/repositories';
import { ErrorCodes } from 'src/common/statusCodes';
import { promisify } from 'util';
import { GeneratedTokensDto } from './dto/Tokens.dto';
import { IAdmin } from './dto/common';
import { GeneratedTokens, GoogleProfile, LoginAdminDto } from './auth.types';
import { GoogleAuthOptions } from './dto/Login.dto';
import axios from 'axios';
import { BaseOutDto, generateResponse } from 'src/common/dto/baseOut.dto';
import { InfoCodes } from 'src/common/statusCodes/infos';
import { UsersService } from 'src/users/users.service';
import { TokenInfo } from 'src/users/users.types';

@Injectable()
export class AuthService {
  private readonly admins: IAdmin[];

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService
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

  async validateUser(email: string, password: string): Promise<{ id: number }> {
    const user: {
      id: number;
      password: string;
      email: string;
      active: boolean;
      blocked: boolean;
      block_count: number;
    } = await this.usersRepository.getUser(email.toLowerCase());

    const id = Number(user.id);

    if (!user || !user.password) {
      throw new ForbiddenException(ErrorCodes.CredentialsNotValid);
    }
    if (!user.active) {
      throw new BadRequestException(ErrorCodes.EmailNotVerified);
    }
    if (user.blocked) {
      throw new BadRequestException(ErrorCodes.NotEnoughPermissions);
    }

    const result = await promisify(bcrypt.compare)(password, user.password);

    if (!result) {
      this.usersRepository.update(
        { id },
        { block_count: user.block_count + 1 }
      );
      if (user.block_count + 1 >= 5) {
        this.usersRepository.update({ id }, { blocked: true });
      }
      throw new ForbiddenException(ErrorCodes.CredentialsNotValid);
    }
    this.usersRepository.update({ id }, { block_count: 0 });
    return {
      id: user.id,
    };
  }

  async executeUserWithToken(
    user: TokenInfo,
    social?: boolean
  ): Promise<BaseOutDto> {
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
      return generateResponse({
        ...tokens,
        user: mappedData,
      });
    }

    return generateResponse({ code: InfoCodes.NeedVerifyEmail });
  }

  async getGoogleProfileByToken(
    token: string,
    platform: string
  ): Promise<GoogleProfile | any> {
    try {
      if (platform === 'android') {
        return this.jwtService.decode(token);
      }
      const options: GoogleAuthOptions = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const {
        data,
      }: {
        data: GoogleProfile;
      } = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo?alt=json',
        options
      );
      return data;
    } catch (err) {
      throw new BadRequestException(ErrorCodes.WrongToken);
    }
  }

  async validateSocialProfile(
    profile: Partial<GoogleProfile>,
    customEmail: string
  ): Promise<BaseOutDto> {
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
      true
    );
  }
}
