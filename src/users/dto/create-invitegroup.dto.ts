import {ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsString, Max, MaxLength, Min, MinLength} from "class-validator";

export class CreateInviteGroupDto {
  /**
   * A list of identifiers as plain numbers, each one corresponding to a known `UserEntity`.
   * Duplicates will not invalidate the request but are obivously pointless as they are discarded.
   * It is **an error** to put in an *invalid* id (i.e an id that does not refer to a valid user) or the id
   * of the user that is creating the invite group.
   *
   * At least 2 distinct ids must be provided, and at most 20.
   */

  @IsNumber({}, { each: true })
  @ArrayMaxSize(20)
  @ArrayMinSize(2)
  userIds: number[];

  /**
   * The name of the invite group, which must be UNIQUE at the user level.
   * 3-50 characters max.
   */

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  label: string;
}
