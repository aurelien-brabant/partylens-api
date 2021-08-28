import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {UserExistsGuard} from 'src/users/guard/user-exists.guard';
import {CreatePartyDto} from '../dto/create-party.dto';
import {PartiesService} from '../service/parties.service';

@Controller('/users/:userId/parties')
@UseGuards(UserExistsGuard)
export class PartiesController {
  constructor(
    private readonly partiesService: PartiesService
  ) { }

  @Get('/')
  findUserParties(
    @Param('userId') userId: number,
    @Query('populate_members') populateMembers: boolean,
    @Query('strict_party_matching') strictPartyMatching: boolean,
  )
  {
    return this.partiesService.findPartiesForUser(userId, { populateMembers, strictPartyMatching });
  }

  @Post('/')
  create(@Param('userId') userId: number, @Body() partyData: CreatePartyDto) {
    this.partiesService.create(userId, partyData);
  }
}
