import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {CreatePartymemberDto} from './dtos/create-partymember.dto';
import {PartymembersService} from './partymembers.service';

@Controller()
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
