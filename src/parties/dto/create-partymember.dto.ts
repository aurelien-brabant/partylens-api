import {IsNumber, IsOptional} from "class-validator";
import { IsValidNametag } from "src/validators/services/isValidNametag";

export class CreatePartymemberDto {
  /**
   * The nametag that refers to the user which is added to the party.
   */
  @IsValidNametag()
  nametag: string;

  /**
   * The set of permissions the party member has, encoded on 32 bits.
   * @see partylens-permissions package for how to make use of permissions.
   */
  @IsOptional()
  @IsNumber()
  permissionBits?: number;
}