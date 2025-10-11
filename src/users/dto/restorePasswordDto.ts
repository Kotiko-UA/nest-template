import { IsString } from "class-validator";
import { IsPassword } from "src/common/validators/password";
import { Transform } from 'class-transformer';

export class RestorePasswordDto {
  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsPassword()
  @IsString()
  password: string;

  @IsString()
  verificationCode: string;
}
