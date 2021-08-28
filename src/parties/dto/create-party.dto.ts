import {Type} from "class-transformer";
import {IsArray, IsDateString, IsNumber, IsObject, IsOptional, IsString, ValidateNested} from "class-validator";
import {PartymemberEntity} from "../entity/partymember.entity";
import {CreatePartymemberDto} from "./create-partymember.dto";

export class CreatePartyDto {
  @IsString() 
  name: string;

  @IsString()
  description: string;

  @IsDateString()
  startDate: string;

  @IsArray()
  @ValidateNested({ each: true }) 
  @IsOptional()
  @Type(() => CreatePartymemberDto)
  members: CreatePartymemberDto[];
}
