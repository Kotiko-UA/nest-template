import { IsEmail, IsOptional, IsString } from "class-validator";

export class BodyTokenDto {
    @IsString()
    @IsOptional()
    readonly access_token?: string;
  
    @IsString()
    @IsOptional()
    readonly id_token?: string;
  
    @IsString()
    @IsEmail()
    @IsOptional()
    readonly email?: string;
  }