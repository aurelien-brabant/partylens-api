import { Inject, Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { UsersService } from "../../users/service/users.service";
import { isNametag } from "../lib/isNametag";

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidNametagValidator implements ValidatorConstraintInterface {
    constructor(
        @Inject(UsersService)
        private readonly usersService: UsersService
    ){};

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
        && isNametag(nametag) && !!await this.usersService.findByNametag(nametag);
    }
}

export function IsValidNametag(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidNametag',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidNametagValidator
    });
  };
}