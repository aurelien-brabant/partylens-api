import {IsArray, IsDateString, IsNumber, IsObject, IsOptional, IsString} from "class-validator";
import {CreatePartymemberDto} from "src/partymembers/dtos/create-partymember.dto";
import {PartymemberEntity} from "src/partymembers/partymember.entity";

export class CreatePartyDto {
  @IsString() 
  name: string;

  @IsString()
  description: string;

  @IsDateString()
  startDate: string;

  @IsArray()
  @IsOptional()
  members: Partial<PartymemberEntity>[];
}
