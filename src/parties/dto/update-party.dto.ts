import {PartialType} from "@nestjs/swagger";
import {CreatePartyDto} from "./create-party.dto";

export class UpdatePartyDto extends PartialType(CreatePartyDto) {};
