import {
  ExecutionContext,
  Injectable,
  CanActivate,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorCodes } from '../statusCodes';

@Injectable()
export class UserAccessGuard implements CanActivate {
  private readonly USER_ROLE: number;

  constructor(private readonly reflector: Reflector) {
    this.USER_ROLE = 3;
  }

  canActivate(context: ExecutionContext): boolean {
    const { user, params } = context.switchToHttp().getRequest();

    const userField = this.reflector.get<string>(
      'userField',
      context.getHandler(),
    );

    if (
      userField &&
      params[userField] !== user.id &&
      user.roleId === this.USER_ROLE
    ) {
      throw new BadRequestException(ErrorCodes.NotEnoughPermissions);
    }

    return true;
  }
}
