import { IsEmail, IsOptional, IsString } from 'class-validator';
import { IsPassword } from 'src/common/validators/password';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  name: string;

  @IsString()
  // @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  // @IsPassword()
  password: string;
}
