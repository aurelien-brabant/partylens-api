import {IsNumber, IsOptional, IsString} from "class-validator";

export class CreatePartyItemDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  /**
   * Id reference to the PartymemberEntity object that wants to create the item
   */
  @IsNumber()
  ownerId: number;

  /**
   * How much of this item is needed to satisfy the proposal
   */
  @IsNumber()
  amountGoal: number;
}
