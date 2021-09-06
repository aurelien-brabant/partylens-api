import {IsEmail, IsString, Matches, MaxLength, MinLength} from "class-validator";
import { IsUsername } from "src/validators/services/IsUsername";

export class CreateUserDto {
  @IsEmail()
  email: string;

  /**
   * RegExp description
   * - must start with any letter (digits are excluded - case does not matter)
   * - minimum length: 3, maximum: 15
   * - underscores ('_') are allowed, except for the first and last characters.
   */

  @Matches(/^[a-z]{1}[a-z0-9_]{1,13}[a-z0-9]{1}$/i)
  name: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  password: string;
}
