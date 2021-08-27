import {IsBoolean, IsBooleanString, IsNumber} from "class-validator";

export class CreatePartymemberDto {
  @IsNumber()
  id: number;

  @IsBoolean()
  canEditItems: boolean;

  @IsBoolean()
  canUseChat: boolean;
}
