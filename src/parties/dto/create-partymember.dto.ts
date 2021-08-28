import {IsBoolean, IsBooleanString, IsNumber, IsOptional} from "class-validator";

export class CreatePartymemberDto {
  /**
   * Determines whether or not the member will be able to add new item proposals and bring items to the party.`
   */
  @IsBoolean()
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
}
