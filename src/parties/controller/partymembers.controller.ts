import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {UserExistsGuard} from 'src/users/guard/user-exists.guard';
import {CreatePartymemberDto} from '../dto/create-partymember.dto';
import {PartymembersService} from '../service/partymembers.service';

@Controller('/users/:userId/parties/:partyId/members')
@UseGuards(UserExistsGuard)
export class PartymembersController {
  constructor(
    private readonly partymembersService: PartymembersService
  ) {};

  @Get()
  findAll(@Param('partyId') partyId: number) {
    return this.partymembersService.findAll(partyId);
  } 

  @Post()
  create(@Param('partyId') partyId: number, @Body() partymemberData: CreatePartymemberDto) {
    return this.partymembersService.create(partyId, partymemberData);
  }
}
