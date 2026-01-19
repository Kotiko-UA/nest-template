import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ForbiddenAppException } from '../exceptions';
import { ErrorCodes } from '../statusCodes';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const roleName: string | undefined = user?.role?.name;

    if (!roleName) {
      throw new ForbiddenAppException(ErrorCodes.NotEnoughPermissions);
    }

    if (!requiredRoles.includes(roleName)) {
      throw new ForbiddenAppException(ErrorCodes.NotEnoughPermissions);
    }

    return true;
  }
}
