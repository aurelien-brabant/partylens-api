import {IsBoolean, IsEnum, IsNumber, IsOptional} from "class-validator";
import {PartyUserRole} from "../entity/partymember.entity";

export class CreatePartymemberDto {
  /**
   * Determines whether or not the member will be able to add new item proposals and bring items to the party.`
   */
  @IsNumber()
  id: number;

  /**
   * Determines whether or not the member will be able to add new item proposals and bring items to the party.`
   */
  @IsBoolean()
  @IsOptional()
  canEditItems?: boolean;

  /**
   * Determines if the member will be able to send messages to the party's chat. Reading the chat is always permitted.
   */
  @IsBoolean()
  @IsOptional()
  canUseChat?: boolean;

  @IsEnum({
    enum: PartyUserRole
  })
  @IsOptional()
  role?: PartyUserRole;
}
