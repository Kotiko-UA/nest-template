import { IsEmail, IsString } from 'class-validator';
import { Transform } from 'class-transformer';


export class VerifyUserDto {
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;
  
  @IsString()
  verificationCode: string;
}

export class SendVerifyCodeDto {
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    email: string;
  }
  
export class VerifyCodeDto {
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;
  
  @IsString()
  verificationCode: string;
}