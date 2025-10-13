import { registerDecorator } from 'class-validator';

export function IsPassword() {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsPassword',
      target: object.constructor,
      propertyName,
      options: {
        message:
          'Password must contain at least 8 characters, 1 number, 1 upper and 1 lowercase!',
      },
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validate(value: any) {
          return (
            typeof value === 'string' &&
            value.length > 0 &&
            Boolean(
              value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z\W]{8,}$/),
            )
          );
        },
      },
    });
  };
}
