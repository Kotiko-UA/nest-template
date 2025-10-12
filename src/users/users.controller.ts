import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Request,
  Get,
  Patch,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import {
  BaseOutDto,
  generateResponse,
  successResponseData,
} from 'src/common/dto/baseOut.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  SendVerifyCodeDto,
  VerifyCodeDto,
  VerifyUserDto,
} from './dto/verifyUserDto';
import { ChangePasswordDto } from './dto/changePasswordDto';
import { RestorePasswordDto } from './dto/restorePasswordDto';
import { UsersRepository } from 'src/common/repositories';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/createUserDto';
import { UpdateUserDto } from './dto/updateUserDto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ErrorCodes } from 'src/common/statusCodes';

@Controller('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private usersRepository: UsersRepository,
  ) {}

  @Post('/register')
  // TODO: add to get photo
  // @UseInterceptors(
  //   FileUploadInterceptor('files', {
  //     maxFiles: 3,
  //     maxFileSize: 5 * 1024 * 1024,
  //     allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  //     useMemoryStorage: false,
  //   }),
  // )
  @HttpCode(200)
  async register(
    @Request() req,
    @Body() body: RegisterDto,
    // @UploadedFiles() files: any[]
  ): Promise<BaseOutDto> {
    // TODO: add to get photo
    // const { filesData } = req;
    const user = await this.usersService.registerUser(body);
    return generateResponse({
      active: user.active,
      blocked: user.blocked,
      email: user.email,
    });
  }

  @Post('/verify')
  @HttpCode(200)
  async verify(@Body() body: VerifyUserDto): Promise<BaseOutDto> {
    const { verificationCode, email } = body;
    const data = await this.usersService.verifyUser(verificationCode, email);
    const user = await this.usersRepository.getUserInfo(data.id);
    return generateResponse({ user });
  }

  @Post('/validate-verify-code')
  @HttpCode(200)
  async validateCode(@Body() body: VerifyCodeDto): Promise<BaseOutDto> {
    const { verificationCode, email } = body;
    await this.usersService.validateVerificationCode(verificationCode, email);
    return successResponseData;
  }

  @Post('/send-verify-code')
  @HttpCode(200)
  async sendVerifyCode(@Body() body: SendVerifyCodeDto): Promise<BaseOutDto> {
    const { email } = body;
    await this.usersService.sendVerifyCode(email);
    return successResponseData;
  }

  @Post('/send-email-restore-password')
  @HttpCode(200)
  async sendResetLink(@Body() body: SendVerifyCodeDto): Promise<BaseOutDto> {
    const { email } = body;
    await this.usersService.sendResetLink(email);
    return successResponseData;
  }
  @Post('/restore-password')
  @HttpCode(200)
  async restorePassword(@Body() body: RestorePasswordDto): Promise<BaseOutDto> {
    await this.usersService.restorePassword(body);
    return successResponseData;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/current')
  @HttpCode(200)
  async getUserInfo(@Request() req): Promise<BaseOutDto> {
    const {
      user: { id: userId },
    } = req;
    const data = await this.usersService.getUserInfo(userId);
    return generateResponse(data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles('admin')
  @Get('/')
  getAll(@Request() req) {
    const { user } = req;
    if (user.role !== 1) {
      throw new ForbiddenException(ErrorCodes.CredentialsNotValid);
    }
    return this.usersService.getAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/change-password')
  @HttpCode(200)
  async changePassword(
    @Body() body: ChangePasswordDto,
    @Request() req,
  ): Promise<BaseOutDto> {
    const {
      user: { id: userId },
    } = req;
    await this.usersService.changePassword(userId, body);
    return successResponseData;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,

    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(+id, updateUserDto);
  }
  @UseGuards(AuthGuard('jwt'))
  @Roles('admin')
  @Post('block/:id')
  blockUser(@Param('id') id: string, @Request() req) {
    const { user } = req;
    if (user.role !== 1) {
      throw new ForbiddenException(ErrorCodes.CredentialsNotValid);
    }
    return this.usersService.block(+id);
  }
}
