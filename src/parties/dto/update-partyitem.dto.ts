import {PartialType} from "@nestjs/swagger";
import {CreatePartyItemDto} from "./create-partyitem.dto";

export class UpdatePartyItemDto extends PartialType(CreatePartyItemDto) {}
