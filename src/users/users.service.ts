import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { AuthInfo } from 'src/auth/auth.types';
import { RolesRepository, UsersRepository } from 'src/common/repositories';
import { ErrorCodes } from 'src/common/statusCodes';
import { NodemailerService } from 'src/shared/services';
import { promisify } from 'util';
import { RegisterDto } from './dto/createUserDto';
import { RestorePasswordDto } from './dto/restorePasswordDto';
import { ChangePasswordDto } from './dto/changePasswordDto';
import { generateEmailMessage } from 'src/common/utils/emailMessages';
import { UpdateUserDto } from './dto/updateUserDto';

@Injectable()
export class UsersService {
  private frontendUrl: string;

  constructor(
    private configService: ConfigService,
    private usersRepository: UsersRepository,
    private readonly mailerService: NodemailerService,
    private rolesRepository: RolesRepository,
  ) {
    this.frontendUrl = this.configService.get('data.frontendUrl');
  }

  generateRandomCode(length: number): string {
    const randomBytesCount = Math.ceil(length / 2);
    const randomBytesBuffer = randomBytes(randomBytesCount);
    const randomCode = randomBytesBuffer.toString('hex').slice(0, length);
    return randomCode;
  }

  async registerUser(body: RegisterDto, isSocial: boolean = false) {
    const { email, password } = body;

    const role = await this.rolesRepository.getRole('user');
    const verificationCode = this.generateRandomCode(6);

    const newUser = {
      ...body,
      token: '',
      // TODO: remove true on active
      active: true,
      // active: isSocial,
      verificationCode,
      password: password
        ? await bcrypt.genSalt(10).then(salt => bcrypt.hash(password, salt))
        : null,
      role: { id: role.id },
    };

    const userExist = await this.usersRepository.findOne({
      where: { email },
    });

    if (userExist) {
      throw new BadRequestException(ErrorCodes.IsAlreadyExist);
    }

    // if (isSocial) {
    //   await this.mailerService.sendMail(
    //     [email],
    //     'Thanks for registration',
    //     generateEmailMessage('socialRegistration', {})
    //   );
    // } else {
    //   await this.mailerService.sendMail(
    //     [email],
    //     'Thanks for registration',
    //     generateEmailMessage('registration', { verificationCode })
    //   );
    // }

    const user = await this.usersRepository.save(newUser);
    return {
      ...user,
      roleId: role.id,
    };
  }

  async checkUser(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async verifyUser(verificationCode: string, email: string) {
    const user = await this.usersRepository.findOne({
      where: { verificationCode, email },
    });
    if (!user) {
      throw new BadRequestException(ErrorCodes.UserNotFound);
    }

    const payload = {
      active: true,
      verificationCode: '',
    };
    await this.usersRepository.update(user.id, { ...payload });
    return user;
  }

  async validateVerificationCode(verificationCode: string, email: string) {
    const user = await this.usersRepository.findOne({
      where: { verificationCode, email },
    });
    if (!user) {
      throw new BadRequestException(ErrorCodes.VerificationCodeNotValid);
    }
  }

  async updateUserVerifyCode(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new BadRequestException(ErrorCodes.UserNotFound);
    }

    const verificationCode = this.generateRandomCode(6);
    await this.usersRepository.update(user.id, { verificationCode });

    return verificationCode;
  }

  async sendVerifyCode(email: string) {
    const verificationCode = await this.updateUserVerifyCode(email);

    return await this.mailerService.sendMail(
      [email],
      'Verify email',
      generateEmailMessage('verifyEmail', { verificationCode }),
    );
  }

  async sendResetLink(email: string) {
    const verificationCode = await this.updateUserVerifyCode(email);

    return await this.mailerService.sendMail(
      [email],
      'Reset password',
      generateEmailMessage('resetPassword', {
        frontendUrl: this.frontendUrl,
        email: encodeURIComponent(email),
        verificationCode: encodeURIComponent(verificationCode),
      }),
    );
  }

  async restorePassword(body: RestorePasswordDto) {
    let { email, password, verificationCode } = body;

    const userExist = await this.usersRepository.findOne({
      where: { email, verificationCode },
    });
    if (!userExist) {
      throw new BadRequestException(ErrorCodes.UserNotFound);
    }

    const newPassword = await bcrypt
      .genSalt(10)
      .then(salt => bcrypt.hash(password, salt));
    await this.usersRepository.update(
      { email },
      { password: newPassword, verificationCode: '' },
    );
  }

  async getUserInfo(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new BadRequestException(ErrorCodes.UserNotFound);
    }
    return user;
  }

  async changePassword(id: number, body: ChangePasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new BadRequestException(ErrorCodes.UserNotFound);
    }

    const result = await promisify(bcrypt.compare)(
      body.password,
      user.password,
    );
    if (!result) {
      throw new ForbiddenException(ErrorCodes.CredentialsNotValid);
    }

    const newPassword = await bcrypt
      .genSalt(10)
      .then(salt => bcrypt.hash(body.newPassword, salt));
    return await this.usersRepository.update(id, { password: newPassword });
  }
  async getAll() {
    const users = await this.usersRepository.find({
      where: { role: { id: 2 } },
      select: {
        name: true,
        blocked: true,
        email: true,
        id: true,
        phone: true,
        active: true,
      },
      order: { id: 'ASC' },
    });
    return users;
  }

  async update(id: number, updateUserDTO: UpdateUserDto) {
    // TODO: доробити логіку редагування
    return this.usersRepository.update({ id }, updateUserDTO);
  }
  async block(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    await this.usersRepository.update(
      { id },
      { blocked: !user.blocked, block_count: 0 },
    );
  }
}
