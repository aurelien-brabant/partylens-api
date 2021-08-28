import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {UserExistsGuard} from 'src/users/guard/user-exists.guard';
import {CreatePartymemberDto} from '../dto/create-partymember.dto';
import {UpdatePartymemberDto} from '../dto/update-partymember.dto';
import {PartyExistsGuard} from '../guard/party-exists.guard';
import {PartymembersService} from '../service/partymembers.service';

@Controller('/users/:userId/parties/:partyId/members')
@UseGuards(UserExistsGuard, PartyExistsGuard)
export class PartymembersController {
  constructor(
    private readonly partymembersService: PartymembersService
  ) {};

  /* TODO: authorization: any user that is involved in a given party can see which members are in.
   */

  @Get('/')
  findAll(@Param('partyId') partyId: number) {
    return this.partymembersService.findAll(partyId);
  } 

  /* TODO: authorization: any user that is involved in a given party can get generic information about a given member.
   * */

  @Get('/:memberId')
  findById(
    @Param('memberId') memberId: number,
    @Param('partyId') partyId: number,
  ) {
    return this.partymembersService.findById(partyId, memberId);
  }

  /* TODO: authorization: only party administrators are able to invite new members.
  * */

  @Post('/')
  create(@Param('partyId') partyId: number, @Body() partymemberData: CreatePartymemberDto) {
    return this.partymembersService.create(partyId, partymemberData);
  }

  /* TODO: authorization: member edit rights are granted to party administrators.
  * */

  @Patch('/:memberId')
  patch(
    @Param('memberId') memberId: number,
    @Param('partyId') partyId: number,
    @Body() attrs: UpdatePartymemberDto
  ) {
    return this.partymembersService.patch(partyId, memberId, attrs)
  }

  /* TODO: authorization: member deletion rights are granted to party administrators and to the user
   * the member refers to.
   */

  @Delete('/:memberId')
  removeMemberFromParty(
    @Param('memberId') memberId: number,
    @Param('partyId') partyId: number,
  ) {
    return this.partymembersService.remove(partyId, memberId);
  }
}
