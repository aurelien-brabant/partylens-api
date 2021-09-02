import {PartialType} from "@nestjs/swagger";
import {IsEnum, IsOptional} from "class-validator";
import {PartymemberState} from "../entity/partymember.entity";
import {CreatePartymemberDto} from "./create-partymember.dto";

export class UpdatePartymemberDto extends PartialType(CreatePartymemberDto)  {
  /**
   * Specifies a new state for the user. For example, a state change occurs when a user which's invitation is pending is accepted.
   */
  @IsEnum(PartymemberState)
  @IsOptional()
  state?: PartymemberState;
}
