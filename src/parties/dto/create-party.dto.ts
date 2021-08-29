import {Type} from "class-transformer";
import {IsArray, IsDateString, IsOptional, IsString, ValidateNested} from "class-validator";
import {CreatePartymemberDto} from "./create-partymember.dto";

export class CreatePartyDto {
  @IsString() 
  name: string;

  @IsString()
  description: string;

  /**
   * The date at which the party is expected to start. This date must be encoded using Date.prototype.toJSON()
   */
  @IsDateString()
  startDate: string;

  /**
   * A list of members to invite as soon as the party is created.
   * This list is optional because members can be invited at any time using create and update operations.
   * In particular, see route /users/:userId/parties/:partyId/members`
   */
  @IsArray()
  @ValidateNested({ each: true }) 
  @IsOptional()
  @Type(() => CreatePartymemberDto)
  members?: CreatePartymemberDto[];
}
