import {IsArray, IsDateString, IsNumber, IsObject, IsOptional, IsString} from "class-validator";
import {PartymemberEntity} from "../entity/partymember.entity";

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
