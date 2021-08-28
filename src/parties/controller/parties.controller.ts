import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {UserExistsGuard} from 'src/users/guard/user-exists.guard';
import {CreatePartyDto} from '../dto/create-party.dto';
import {UpdatePartyDto} from '../dto/update-party.dto';
import {PartiesService} from '../service/parties.service';

@Controller('/users/:userId/parties')
@UseGuards(UserExistsGuard)
export class PartiesController {
  constructor(
    private readonly partiesService: PartiesService
  ) { }

  /* TODO: authorization: only the currently logged in user can view its list of parties.
   * Only him and partylens administrators can access this route.
   */

  @Get('/')
  findUserParties(
    @Param('userId') userId: number,
    @Query('populate_members') populateMembers: boolean,
    @Query('strict_party_matching') strictPartyMatching: boolean,
  )
  {
    return this.partiesService.findPartiesForUser(userId, { populateMembers, strictPartyMatching });
  }

  /*
   ** TODO: authorization: see above route.
   */

  @Get('/:partyId')
  findUserParty(
    @Param('userId') userId: number,
    @Param('partyId') partyId: number
  ) {
    return this.partiesService.findUserPartyById(userId, partyId);
  }

  /*
   ** TODO: authorization: see above route.
   */

  @Post('/')
  create(@Param('userId') userId: number, @Body() partyData: CreatePartyDto) {
    return this.partiesService.create(userId, partyData);
  }

  /*
   ** TODO: authorization: see above route.
   */

  @Patch('/:partyId')
  editUserParty(
    @Param('userId') userId: number,
    @Param('partyId') partyId: number,
    @Body() attrs: UpdatePartyDto,
  )
  {
    return this.partiesService.updateUserParty(userId, partyId, attrs);
  }

  @Delete('/:partyId')
  deleteParty(
    @Param('userId') userId: number,
    @Param('partyId') partyId: number,
  )
  {
    return this.partiesService.deleteUserParty(userId, partyId);
  }
}
