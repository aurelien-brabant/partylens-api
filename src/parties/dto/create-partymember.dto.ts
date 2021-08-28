import {IsBoolean, IsBooleanString, IsNumber, IsOptional} from "class-validator";

export class CreatePartymemberDto {
  @IsNumber()
  id: number;

  @IsBoolean()
  @IsOptional()
  canEditItems?: boolean;

  @IsBoolean()
  @IsOptional()
  canUseChat?: boolean;
}
