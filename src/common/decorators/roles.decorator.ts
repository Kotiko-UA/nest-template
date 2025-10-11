import { CustomDecorator, SetMetadata } from '@nestjs/common';

const allRoles = {
  admin: 1,
  user: 2,
};

export const Roles = (...roles: string[]): CustomDecorator<unknown> => {
  const definedRoles = roles.reduce(
    (acc: Record<string, boolean>, item: string) => {
      acc[allRoles[item]] = true;
      return acc;
    },
    {},
  );

  return SetMetadata<unknown>('roles', definedRoles);
};
