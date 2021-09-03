import {ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateNested} from "class-validator";

export class CreateInviteGroupDto {

  /**
   * RegExp description:
   * First part before '#' is partylens's username format @see CreateUserDto
   * username is directly followed by a pound sign '#' and EXACTLY 4 digits.
   * 
   * Each nametag in the array is tested with these constraints, and request is
   * invalidated if at least one is invalid.
   */
  
  @IsArray()
  @Matches(/$[a-z][a-z0-9_]{1,13}[a-z0-9]#[0-9]{4}^/i, {
    each: true
  })

  @ArrayMaxSize(20)
  @ArrayMinSize(2)
  userNametags: string[];

  /**
   * The name of the invite group, which must be UNIQUE at the user level.
   * 3-50 characters max.
   */

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  label: string;
}