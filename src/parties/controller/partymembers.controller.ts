import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {JwtAuthGuard} from 'src/auth/guard/jwt-auth.guard';
import {CreatePartymemberDto} from '../dto/create-partymember.dto';
import {UpdatePartymemberDto} from '../dto/update-partymember.dto';
import {PartyExistsGuard} from '../guard/party-exists.guard';
import {PartymembersService} from '../service/partymembers.service';

@ApiTags('Party management')
@Controller('/parties/:partyId/members')
@UseGuards(JwtAuthGuard, PartyExistsGuard)
export class PartymembersController {
  constructor(
    private readonly partymembersService: PartymembersService
  ) {};

  @Get('/')
  findAll(@Param('partyId') partyId: number) {
    return this.partymembersService.findAll(partyId);
  } 

  @Get('/:memberId')
  findOne(
    @Param('memberId') memberId: number,
    @Param('partyId') partyId: number,
  ) {
    return this.partymembersService.findById(partyId, memberId);
  }

  @Post('/')
  create(@Param('partyId') partyId: number, @Body() partymemberData: CreatePartymemberDto) {
    return this.partymembersService.create(partyId, partymemberData);
  }

  @Patch('/:memberId')
  update(
    @Request() req: any,
    @Param('memberId') memberId: number,
    @Param('partyId') partyId: number,
    @Body() attrs: UpdatePartymemberDto
  ) {
    return this.partymembersService.patch(req.user.id, partyId, memberId, attrs)
  }

  @Delete('/:memberId')
  removeMemberFromParty(
    @Param('memberId') memberId: number,
    @Param('partyId') partyId: number,
  ) {
    return this.partymembersService.remove(partyId, memberId);
  }
}
