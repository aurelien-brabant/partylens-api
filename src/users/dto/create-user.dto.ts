import {IsEmail, IsString, MaxLength, MinLength} from "class-validator";
import { IsUsername } from "src/validators/services/IsUsername";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsUsername()
  name: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  password: string;
}
