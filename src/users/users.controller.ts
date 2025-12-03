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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
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
import { ForbiddenAppException } from 'src/common/exceptions';
// import { R2StorageService } from 'src/r2/storage.service';
// import { FileUploadInterceptor } from 'src/common/interseptors/file-upload.interceptor';

@Controller('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private usersRepository: UsersRepository,
    // private readonly r2: R2StorageService,
  ) {}

  @Post('/register')
  // TODO: add to get photo
  // @UseInterceptors(
  //   FileUploadInterceptor('files', {
  //     maxFiles: 3,
  //     maxFileSize: 5 * 1024 * 1024,
  //     allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  //     allowedExtensions: ['pdf','doc','docx','xls','xlsx','jpg','jpeg','png'],
  //     useMemoryStorage: true,
  //   }),
  // )
  @HttpCode(200)
  async register(
    @Request() req,
    @Body() body: RegisterDto,
    // @UploadedFiles() files: File[],
  ) {
    const user = await this.usersService.registerUser(body);
    // let fileLinks: string[] = [];

    // if (files?.length) {
    //   const uploads = await this.r2.uploadMany(files, {
    //     prefix: `assign-appraisal/${user.id}`,
    //     makePublicUrl: true,
    //   });

    //   fileLinks = uploads
    //     .map(u => u.url)
    //     .filter((v): v is string => Boolean(v));
    // }

    return {
      active: user.active,
      blocked: user.blocked,
      email: user.email,
      // fileLinks,
    };
  }

  @Post('/verify')
  @HttpCode(200)
  async verify(@Body() body: VerifyUserDto) {
    const { verificationCode, email } = body;
    const data = await this.usersService.verifyUser(verificationCode, email);
    const user = await this.usersRepository.getUserInfo(data.id);
    return { user };
  }

  @Post('/validate-verify-code')
  @HttpCode(200)
  async validateCode(@Body() body: VerifyCodeDto) {
    const { verificationCode, email } = body;
    await this.usersService.validateVerificationCode(verificationCode, email);
    return {};
  }

  @Post('/send-verify-code')
  @HttpCode(200)
  async sendVerifyCode(@Body() body: SendVerifyCodeDto) {
    const { email } = body;
    await this.usersService.sendVerifyCode(email);
    return {};
  }

  @Post('/send-email-restore-password')
  @HttpCode(200)
  async sendResetLink(@Body() body: SendVerifyCodeDto) {
    const { email } = body;
    await this.usersService.sendResetLink(email);
    return {};
  }
  @Post('/restore-password')
  @HttpCode(200)
  async restorePassword(@Body() body: RestorePasswordDto) {
    await this.usersService.restorePassword(body);
    return {};
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/current')
  @HttpCode(200)
  async getUserInfo(@Request() req) {
    const {
      user: { id: userId },
    } = req;
    const data = await this.usersService.getUserInfo(userId);
    return data;
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles('admin')
  @Get('/')
  getAll(@Request() req) {
    const { user } = req;
    if (user.role !== 1) {
      throw new ForbiddenAppException(ErrorCodes.CredentialsNotValid);
    }
    return this.usersService.getAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/change-password')
  @HttpCode(200)
  async changePassword(@Body() body: ChangePasswordDto, @Request() req) {
    const {
      user: { id: userId },
    } = req;
    await this.usersService.changePassword(userId, body);
    return {};
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
      throw new ForbiddenAppException(ErrorCodes.CredentialsNotValid);
    }
    return this.usersService.block(+id);
  }
}
