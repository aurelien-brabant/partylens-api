import {BadRequestException, UnauthorizedException} from '@nestjs/common';
import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import {ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiNotFoundResponse, ApiTags, ApiUnauthorizedResponse} from '@nestjs/swagger';
import {CreatePartymemberDto} from '../dto/create-partymember.dto';
import {UpdatePartymemberDto} from '../dto/update-partymember.dto';
import {PartymemberState} from '../entity/partymember.entity';
import { MPBit } from 'partylens-permissions';
import {MemberPermissionGuard} from '../guard/memberpermission.guard';
import {PartyExistsGuard} from '../guard/party-exists.guard';
import {PartymembersService} from '../service/partymembers.service';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { ServiceException } from '../../misc/serviceexception';

@ApiTags('Party Member Management')
@ApiBearerAuth()
@Controller('/parties/:partyId/members')
@UseGuards(JwtAuthGuard, PartyExistsGuard)
export class PartymembersController {
  constructor(
    private readonly partymembersService: PartymembersService,
  ) {};

  @Get('/')
  findAll(@Param('partyId') partyId: number) {
    return this.partymembersService.findAll(partyId);
  } 

  /**
   * Returns information about a particular party member, given its `id`.
   */

  @ApiNotFoundResponse({
    description: 'Member with the given id does not exist for that party.'
  })

  @Get('/:memberId')
  async findOne(
    @Param('memberId') memberId: number,
    @Param('partyId') partyId: number,
  ) {
    const member = await this.partymembersService.findById(partyId, memberId);
    
    if (!member) {
      throw new NotFoundException(`Could not get: member with id #${memberId} does not exist for that party.`);
    }

    return member;
  }

  /**
   * # Permission guard: `MEMBER_INVITE`
   * Add a new user to the given party, creating a new **party member**.
   *
   * Every party member should refer to a valid `UserEntity`. In this case, it must be provided
   * by passing a `nametag` property in the request's body. The nametag is then resolved to a user, ensuring
   * that it indeed refers to a valid user.
   *
   * Permission bits of the created member can be set if the user that adds the member
   * has the `GRANT_PRIVILEGES` permission.
   */

  @ApiNotFoundResponse({
    description: 'Nametag does not refer to a valid user.'
  })

  @ApiConflictResponse({
    description: 'There is already a member that refers to the provided nametag in this party.'
  })

  @ApiUnauthorizedResponse({
    description: 'Member is missing the `MEMBER_INVITE` permission.'
  })

  @UseGuards(MemberPermissionGuard(MPBit.MEMBER_INVITE))
  @Post('/')
  async create(
    @Request() req: any,
    @Param('partyId') partyId: number,
    @Body() partymemberData: CreatePartymemberDto,
  ) 
  {
    try {
      return await this.partymembersService.create(req.user.id, partyId, partymemberData);
    } catch(error) {
      if (error instanceof ServiceException) {
        error.throwAsHttpException();
      }
    }
  }

  /**
   * # OMG FIX ME I AM BROKEN RIGHT NOW
   * ## NO REALLY DON'T ATTEMPT TO USE ME
   *
   * Update a party member given its `id`.
   *
   * # Changing member state:
   * The member state is set to `PENDING` by default, which means that the invitation has been sent to the user but not answered.
   *
   * Member state **can only be changed by the invited user himself**.
   *
   * A member state should never be set back to `PENDING`, an issue is thrown if so.
   *
   * # Changing member role/permissions
   * Member role (i.e if he's administrator or not) can only be changed by party administrators for any member of the party.
   * Permissions (such as `canEditItems` and `canUseChat`) obey to the exact same rule.
   *
   * # Changing owner permissions
   * Currently not possible. Owner caracteristics are immutable.
   */

  @ApiNotFoundResponse({
    description: 'Member with the given id does not exist for that party.'
  })

  @ApiUnauthorizedResponse({
    description: `- Attempt to mutate member representation of party's owner\n- Attempt to edit permissions without \`GRANT_PRIVILEGES\` permission\n - Attempt to edit member state without being logged in as the mutated member`
  })
  
  @ApiUnauthorizedResponse({
    description: 'Attempt to mutate member representation of owner.'
  })

  @ApiBadRequestResponse({
    description: 'Irrelevant member state change (for example, if there is an attempt to change the state back to `PENDING`)'
  })

  @Patch('/:memberId')
  async update(
    @Request() req: any,
    @Param('memberId') memberId: number,
    @Param('partyId') partyId: number,
    @Body() attrs: UpdatePartymemberDto
  )
  {
    const member = await this.partymembersService.findById(partyId, memberId);

    if (!member) {
      throw new NotFoundException(`Could not update: member with id #${memberId} does not exist for that party.`);
    }

    if (member.user.id === req.party.owner.id)  {
      throw new UnauthorizedException('Could not update: owner caracteristics are immutable.');
    }

    /* Ensure potential state modification is legal */
    if (attrs.state && attrs.state !== member.state) {
      if (req.user.id !== member.user.id) {
          throw new UnauthorizedException('Could not change member state: permission denied: only the invited user can modifiy its state.')
      }
      if (attrs.state === PartymemberState.INVITATION_PENDING) {
        throw new BadRequestException('Could not change member state: PENDING state cannot be restored.');
      }
    }

    //const loggedInMember = await this.partymembersService.findUserById(req.user.id, partyId);

    /*
    if (attrs.permissionBits !== undefined 
         && !hasPermissions(loggedInMember.permissionBits, MPBit.GRANT_PRIVILEGES)) {
          throw new UnauthorizedException('Could not update member privileges: permission denied');
    }*/
    
    return this.partymembersService.patch(partyId, memberId, attrs)
  }

  /**
   * # Permission guard: `MEMBER_KICK`
   * Delete a particular member for the given party.
   * Deleting a member completely erases data associated with it: item participation for an important one.
   *
   * Deletion is **reserved** to party administrators for obvious reasons.
   * Deleting owner of a party is not allowed, if party deletion is wanted
   * then the proper `DELETE` request to the `/parties/:id` endpoint will do so.
   *
   * This is **NOT** the same as if the member changes its state to `OUT`.
   */

  @ApiNotFoundResponse({
    description: 'Member with the given id does not exist for that party.'
  })

  @ApiUnauthorizedResponse({
    description: 'Member is not a party administrator.'
  })

  @ApiBadRequestResponse({
    description: 'Attempt to delete the owner of the party.'
  })

  @UseGuards(MemberPermissionGuard(MPBit.MEMBER_KICK))
  @Delete('/:memberId')
  async removeMemberFromParty(
    @Param('memberId') memberId: number,
    @Param('partyId') partyId: number,
    @Request() req: any,
  ) {
    const member = await this.partymembersService.findById(partyId, memberId);

    if (!member) {
      throw new NotFoundException(`Could not delete: member with id #${memberId} does not exist for that party.`);
    }

    if (req.party.owner.id === member.user.id) {
      throw new BadRequestException('Could not delete: owner of the party must not be deleted.');
    }

    return this.partymembersService.remove(member);
  }
}
