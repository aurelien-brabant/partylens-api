import {IsBoolean, IsEnum, IsOptional} from "class-validator";
import {PartymemberState} from "../entity/partymember.entity";

export class UpdatePartymemberDto {
  @IsEnum(PartymemberState)
  @IsOptional()
  state?: boolean;

  @IsBoolean()
  @IsOptional()
  canEditItems?: boolean;
  
  @IsOptional()
  @IsBoolean()
  canUseChat?: boolean;
}
