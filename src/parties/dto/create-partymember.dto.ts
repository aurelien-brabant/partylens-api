import {IsBoolean, IsEnum, IsNumber, IsOptional} from "class-validator";
import {IsNametag} from "src/validator/IsNameTag";

export class CreatePartymemberDto {
  /**
   * The nametag refering to the added user.
   */
  @IsNametag()
  nametag: string;

  @IsOptional()
  @IsNumber()
  permissionBits?: number;
}
