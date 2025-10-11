import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const UserDataField = (field: string): CustomDecorator<string> =>
  SetMetadata('userField', field);
