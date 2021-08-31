import {IsNumber, IsOptional, IsString} from "class-validator";

export class CreatePartyItemDto {
  @IsString()
  label: string;

  @IsString()
  @IsOptional()
  description?: string;

  /**
   * How much of this item is needed to satisfy the proposal
   */
  @IsNumber()
  amountGoal: number;
}
