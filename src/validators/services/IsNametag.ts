import { Injectable } from "@nestjs/common";
import { isArray, registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { mainModule } from "process";
import { isNametag } from "../lib/isNametag";

@ValidatorConstraint()
@Injectable()
export class IsNametagValidator implements ValidatorConstraintInterface {
    defaultMessage(args: ValidationArguments): string
    {
        if (args.value === undefined) {
          return `${args.property} must be a valid nametag.` 
        }
        return `Nametag ${args.value} is not a valid nametag. Nametag must be correctly formatted and refer to a valid user.`;
    }

    async validate(nametag: any): Promise<boolean>
    {
        return typeof nametag === 'string'
        && isNametag(nametag);
    }
}

export function IsNametag(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidNametag',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNametagValidator
    });
  };
}