import {IsNumber, IsOptional, Matches} from "class-validator";

export class CreatePartymemberDto {
  @Matches(/$[a-z][a-z0-9_]{1,13}[a-z0-9]#[0-9]{4}^/i)
  nametag: string;

  /**
   * The set of permissions the party member has, encoded on 32 bits.
   * @see partylens-permissions package for how to make use of permissions.
   */
  @IsOptional()
  @IsNumber()
  permissionBits?: number;
}