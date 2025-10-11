import { IsEmail, IsString, IsObject } from 'class-validator';
import { IsPassword } from '../../common/validators/password';

export class LoginDto {
  @IsString()
  // @IsEmail()
  email: string;

  // @IsPassword()
  @IsString()
  password: string;
}

export class GoogleAuthOptions {
  @IsObject()
  headers: {
    Authorization: string;
  };
}
