import { IsNotEmpty, IsString } from 'class-validator';

export interface AuthInfo {
  id: number;
}

export interface JwtPayload {
  id?: number;
  exp?: number;
  iat: number;
  sub: number;
}

export interface UserInterface {
  email: string;
}

export interface LoginOutdata {
  id: number;
  fullName: string;
  email: string;
  token?: string;
  refreshToken?: string;
}

export interface GeneratedTokens {
  token: string;
  refreshToken: string;
}

export interface LoginAuthOut extends GeneratedTokens {
  data: any;
  type: string;
}

export interface AppleJwtDecode {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  c_hash: string;
  email: string;
  email_verified: string;
  is_private_email: string;
  auth_time: number;
  nonce_supported: boolean;
}

export interface GoogleProfile {
  id: string;
  email?: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
  hd: string;
}
export class LoginAdminDto {
  @IsNotEmpty()
  @IsString()
  adminEmail: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
