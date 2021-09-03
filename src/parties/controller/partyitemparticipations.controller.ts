import {Body, Controller, Delete, Get, NotFoundException, Param, Post, Request, UnauthorizedException, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {JwtAuthGuard} from "src/auth/guard/jwt-auth.guard";
import {CreatePartyItemParticipationDto} from "../dto/create-party-item-participation.dto";
import {PartyItemEntity} from "../entity/partyitem.entity";
import {PartyItemParticipationEntity} from "../entity/partyitemparticipation.entity";
import {PartymemberEntity} from "../entity/partymember.entity";
import { hasPermissions, MPBit } from "partylens-permissions";
import {MemberPermissionGuard} from "../guard/memberpermission.guard";
import {PartyExistsGuard} from "../guard/party-exists.guard";
import {PartyItemExistsGuard} from "../guard/partyitem-exists.guard";
import {PartyitemparticipationsService} from "../service/partyitemparticipations.service";

@ApiBearerAuth()
@ApiTags('Party Item Participation Management')
@UseGuards(JwtAuthGuard, PartyExistsGuard, PartyItemExistsGuard)
@Controller('/parties/:partyId/items/:itemId/participations')
export class PartyitemparticipationsController {

  constructor(
    private readonly participationsService: PartyitemparticipationsService,
  ) {};

  /**
   * Get all the participations for a given item.
   */

  @Get('/')
  findAll()
  {
    return this.participationsService.findAll();
  }

  /**
   * Get a specific participation identified by its `id` for a given item.
   */

  @Get('/:participationId')
  async findOne(
    @Param('participationId') participationId: number,
    @Param('itemId') itemId: number,
  )
  {
    const participation = await this.participationsService.findById(itemId, participationId);

    if (!participation) {
      throw new NotFoundException(`Could not get participation with id #${participationId}: not found.`);
    }

    return participation;
  }

  /**
   * Create a participation for a given party item.
   *
   * ## POST is used for both create and update operations
   * Because it felt logical, **create and update operations have been merged together** for the
   * `PartyItemParticipationEntity`, which means that `POST`ing a new participation will simply
   * replace the previous one, if any, otherwise a new participation will be inserted.
   * 
   * That way the API caller do not have to choose between `POST` and `PATCH`, which, I believe, would have
   * been a *terrible* design choice given the context.
   *
   * ## Updating a participation
   * When updating a participation, the old amount is **REPLACED** by the new amount, there's no
   * incrementation or something like that. It is the reponsability of the API caller to provide the
   * correct new amount of the participation.
   */

  @UseGuards(MemberPermissionGuard(MPBit.NONE))
  @Post(
  )
  async create(
    @Request() req: any,
    @Param('itemId') itemId: number,
    @Body() participationData: CreatePartyItemParticipationDto
  )
  {
    const member: PartymemberEntity = req.userAsPartyMember;
    const item: PartyItemEntity = req.partyItem;

    if (member.id !== item.owner.id
      && hasPermissions(member.permissionBits, MPBit.ITEM_INCREMENT)) {
      throw new UnauthorizedException('Could not create new participation: permission denied.');
    }

    return this.participationsService.create(req.user.id, itemId, participationData)
  }

  /**
   * Delete a participation
   */

  @Delete('/:participationId')
  async removeOne(
    @Param('itemId') itemId: number, 
    @Param('participationId') participationId: number
  ): Promise<PartyItemParticipationEntity> {
    const removed = await this.participationsService.removeOne(itemId, participationId);

    if (!removed) {
      throw new NotFoundException(`Could not delete participation with id #${participationId}: not found in this item.`);
    }

    return removed;
  }
  
}
