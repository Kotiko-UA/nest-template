import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersRepository } from 'src/common/repositories';
import { BaseOutDto, generateResponse } from '../common/dto/baseOut.dto';
import { GeneratedTokens, LoginAdminDto } from './auth.types';
import { LoginDto } from './dto/Login.dto';
import { GeneratedTokensDto } from './dto/Tokens.dto';
import { AuthService } from './auth.service';
import { BodyTokenDto } from './dto/BodyToken.dto';
import { UsersService } from 'src/users/users.service';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('/login')
  @HttpCode(200)
  async login(@Body() body: LoginDto, @Request() req): Promise<BaseOutDto> {
    const { user } = req;

    const userInfo = await this.usersRepository.getUserWithRole(body.email);
    const mappedData = {
      ...userInfo,
    };
    console.log({ user });
    const tokens: GeneratedTokensDto = await this.authService.generateTokens({
      id: user.id,
      role: userInfo.role.id,
    });
    return generateResponse({ ...tokens, user: mappedData });
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(200)
  @Get('/refresh')
  async refresh(@Request() req): Promise<GeneratedTokens> {
    const {
      user: { id, roleId },
    } = req;

    return this.authService.generateTokens({
      id,
      roleId,
    });
  }

  @HttpCode(200)
  @Post('/google')
  async getTokenAfterGoogleSignIn(
    @Body() body: BodyTokenDto,
  ): Promise<BaseOutDto> {
    let googleProfile;
    if (body.id_token) {
      googleProfile = await this.authService.getGoogleProfileByToken(
        body.id_token,
        'android',
      );
      googleProfile.id = googleProfile.sub;
    } else {
      googleProfile = await this.authService.getGoogleProfileByToken(
        body.access_token,
        'any',
      );
    }

    const user = await this.authService.validateSocialProfile(
      googleProfile,
      body.email,
    );

    return user;
  }
}
