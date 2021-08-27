import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {UserExistsGuard} from 'src/users/user-exists.guard';
import {CreatePartyDto} from './dto/create-party.dto';
import {PartiesService} from './parties.service';

@Controller()
export class PartiesController {
  constructor(
    private readonly partiesService: PartiesService
  ) { }

  @UseGuards(UserExistsGuard)
  @Get('/')
  findUserParties(@Param('userId') userId: number, @Query('populate') populate: string)
  {
    return this.partiesService.findPartiesForUser(userId, populate ? populate.split(',') : null);
  }

  @UseGuards(UserExistsGuard)
  @Post('/')
  create(@Param('userId') userId: number, @Body() partyData: CreatePartyDto) {
    this.partiesService.create(userId, partyData);
  }
}
