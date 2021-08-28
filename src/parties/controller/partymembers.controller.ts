import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import {UserExistsGuard} from 'src/users/guard/user-exists.guard';
import {CreatePartymemberDto} from '../dto/create-partymember.dto';
import {PartyExistsGuard} from '../guard/party-exists.guard';
import {PartymembersService} from '../service/partymembers.service';

@Controller('/users/:userId/parties/:partyId/members')
@UseGuards(UserExistsGuard, PartyExistsGuard)
export class PartymembersController {
  constructor(
    private readonly partymembersService: PartymembersService
  ) {};

  @Get('/')
  findAll(@Param('partyId') partyId: number, @Request() req: any) {
    console.log('REQ-PARTY', req.partyResource);
    return this.partymembersService.findAll(partyId);
  } 

  @Post('/')
  create(@Param('partyId') partyId: number, @Body() partymemberData: CreatePartymemberDto) {
    return this.partymembersService.create(partyId, partymemberData);
  }
}
