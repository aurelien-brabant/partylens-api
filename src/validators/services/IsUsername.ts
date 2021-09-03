import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { isUsername } from "../lib/isUsername";

@ValidatorConstraint()
export class IsUsernameValidator implements ValidatorConstraintInterface {
    constructor(
    ){};

    defaultMessage(args: ValidationArguments): string
    {
        if (args.value === undefined) {
          return `${args.property} must be a valid username.`
        }
        return `Username ${args.value} does not fit username's constraints.`;
    }

    validate(username: any): boolean
    {
        return typeof username === 'string' && isUsername(username)
    }
}

export function IsUsername(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidNametag',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsUsernameValidator
    });
  };
}