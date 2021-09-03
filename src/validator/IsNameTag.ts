import {Injectable} from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

export const isNametag = (s: string): boolean =>
{
  return /^[a-z0-9_]{3,15}#[0-9]{4}$/i.test(s);
}

export function IsNametag(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNametag',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {

        defaultMessage(args: ValidationArguments) {
          return `${args.value} is not a valid nametag. A valid nametag has format <username>#XXXX (ex: john#2432)`;
        },
        
        validate(value: any) {
          return typeof value === 'string' && isNametag(value);
        },

      },
    });
  };
}
