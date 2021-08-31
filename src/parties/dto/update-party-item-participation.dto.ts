import {PartialType} from "@nestjs/swagger";
import {CreatePartyItemParticipationDto} from "./create-party-item-participation.dto";

export class UpdatePartyItemParticipationDto extends PartialType(CreatePartyItemParticipationDto) {}
