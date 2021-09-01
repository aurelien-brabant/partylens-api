import {PartialType} from "@nestjs/swagger";
import {CreateInviteGroupDto} from "./create-invitegroup.dto";

export class UpdateInviteGroupDto extends PartialType(CreateInviteGroupDto) {};
