import { IsString } from 'class-validator';
import { IsPassword } from 'src/common/validators/password';

export class ChangePasswordDto {
  @IsString()
  @IsPassword()
  password: string;

  @IsString()
  @IsPassword()
  newPassword: string;
}

  