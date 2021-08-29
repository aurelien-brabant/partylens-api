import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request, Query } from '@nestjs/common';
import {ApiBearerAuth, ApiNotFoundResponse, ApiQuery, ApiTags} from '@nestjs/swagger';
import {JwtAuthGuard} from 'src/auth/guard/jwt-auth.guard';
import {CreatePartyDto} from '../dto/create-party.dto';
import {UpdatePartyDto} from '../dto/update-party.dto';
import {PartiesService} from '../service/parties.service';

@ApiTags('Party management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/parties')
export class PartiesController {
  constructor(
    private readonly partiesService: PartiesService
  ) { }

  /**
   * Returns all the parties the user is involved into.
   * By default, for a normal user, that means any party it owns.
   */

  @ApiQuery({
    name: 'populate_members',
    description: `Populate all the party's members. That way, there is no need for a second request to /parties/:id/members.
    PLEASE note that enabling this option will broaden the selection of returned parties: parties owned by
    the logged in user AND parties in which he's participating will be returned.`
  })
  @ApiQuery({
    name: 'strict_party_matching',
    description: `If populate_members is set to true, disable party broadening and only
    return parties the user owns while still populating its members.`,
  })

  @Get('/')
  findAll(
    @Request() req: any,
    @Query('populate_members') populateMembers: boolean = false,
    @Query('strict_party_matching') strictPartyMatching: boolean = false,
  )
  {
    return this.partiesService.findPartiesForUser(req.user.id, { populateMembers, strictPartyMatching })
  }

  /**
   * Get a specific party, given its universal id.
   * Party matching is user dependant, such as at /parties, HOWEVER, members
   * are ALWAYS populated when getting a specific party by id. That implies
   * that parties in which the logged in user is only a member will be returned.
   *
   * @response 
   * TBD: add support for strict_party_matching here also.
   */

  @Get('/:partyId')
  findOne(
    @Request() req: any,
    @Param('partyId') partyId: number
  ) {
    return this.partiesService.findUserPartyById(req.user.id, partyId,
                                                 () => `Could not get party: party with id #${partyId} does not exist for that user.`);
  }

  @ApiNotFoundResponse({
    description: 'At least one member in the members array refers to a non existing user.' 
  })

  @Post('/')
  create(
    @Request() req: any,
    @Body() partyData: CreatePartyDto
  ) {
    return this.partiesService.create(req.user.id, partyData);
  }

  /**
   * Access: *party administrator*
   *
   * Update a party given its `id`.
   * 
   * **IMPORTANT NOTE**: when providing an array of members in the request, this array *WON'T*
   * replace the old one: each member in it will be appended to the current one. This offers
   * an easy way to add a group of users in one single API call.
   */

  @Patch('/:partyId')
  editUserParty(
    @Request() req: any,
    @Param('partyId') partyId: number,
    @Body() attrs: UpdatePartyDto,
  )
  {
    return this.partiesService.updateUserParty(req.user.id, partyId, attrs);
  }

  /**
   * Access: *party owner*
   *
   * Delete a party given its `id`, and all the data associated with it such as items, members, and so on.
   *
   * **This is a destructive and irreversible action**.
   */

  @Delete('/:partyId')
  deleteParty(
    @Request() req: any,
    @Param('partyId') partyId: number,
  )
  {
    return this.partiesService.deleteUserParty(req.user.id, partyId);
  }
}
