import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {UserExistsGuard} from 'src/users/guard/user-exists.guard';
import {CreatePartyItemDto} from '../dto/create-partyitem.dto';
import {PartyExistsGuard} from '../guard/party-exists.guard';
import {PartyitemsService} from '../service/partyitems.service';

@ApiTags('User management')
@UseGuards(UserExistsGuard, PartyExistsGuard)
@Controller('/users/:userId/parties/:partyId/items')
export class PartyitemsController {
  constructor(
    private readonly partyitemsService: PartyitemsService
  ) {}

  /**
   * Returns all the items that can be bringed to the party
   */
  @Get('/')
  findAll(
    @Param('partyId') partyId: number
  )
  {
    return this.partyitemsService.findAll(partyId);
  }

  @Post('/')
  create(
    @Param('partyId') partyId: number,
    @Body() itemData: CreatePartyItemDto,
  )
  {
    return this.partyitemsService.create(partyId, itemData);
  }
}
