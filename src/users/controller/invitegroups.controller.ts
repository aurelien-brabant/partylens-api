import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiConflictResponse, ApiNotFoundResponse, ApiTags, ApiUnauthorizedResponse} from "@nestjs/swagger";
import {JwtAuthGuard} from "src/auth/guard/jwt-auth.guard";
import {ServiceException} from "src/misc/serviceexception";
import {CreateInviteGroupDto} from "../dto/create-invitegroup.dto";
import {InviteGroupEntity} from "../entity/invitegroup.entity";
import {InviteGroupsService} from "../service/invitegroups.service";

@ApiBearerAuth()
@ApiTags('Invite Groups')

@UseGuards(JwtAuthGuard)
@Controller('/users/:userId/invitegroups')

export class InviteGroupsController {
  constructor(
    private readonly inviteGroupsService: InviteGroupsService
  ) {};

  /**
   * Get all invite groups made by the user
   */

  @Get('')
  findAll(): Promise<InviteGroupEntity[]>
  {
    return this.inviteGroupsService.findAll();
  }

  /**
   * Create a new invite group for the current user.
   *
   * An `InviteGroupEntity` is basically an array of users. It is mostly used to add
   * recurrent groups of members into a party more efficiently.
   *
   * # Forbidden stuff:
   * - id refering to a non existing user
   * - id refering to the invite group's owner
   */

  @ApiNotFoundResponse({
    description: 'At least one user id do not refer to a valid user. See response error message.'
  })

  @ApiUnauthorizedResponse({
    description: 'Invite group user limit reached.'
  })

  @ApiConflictResponse({
    description: 'Id of the invite group\'s owner has been specified in the `userIds` array.'
  })

  @Post('')
  async createOne(
    @Param('userId') userId: number,
    @Body() igrpData: CreateInviteGroupDto
  ): Promise<InviteGroupEntity>
  {
    try {
      return await this.inviteGroupsService.create(userId, igrpData.label, igrpData.userIds);
    } catch (error) {
      console.log(error);
      if (error instanceof ServiceException) {
        error.throwAsHttpException();
      }
    }
  }

  /**
   * Find a specific invite group for the current user, given the group's `id`.
   */

  @Get('/:inviteId')
  findOne(
    @Param('inviteId') inviteId: number
  )
  {
    return this.inviteGroupsService.findOne(inviteId);
  }

  /**
   * Update an invite group for the current user, given the group's `id`.
   *
   * Updating an invite group is basically mutating the array of user that is bound
   * to it. This is done by providing a new users array. There's no add/remove way of doing
   * it.
   */

  @Patch(':/inviteId')
  updateOne(
    @Param('inviteId') inviteId: number
  )
  {
    return null;
  }

  @Delete(':/inviteId')
  removeOne(
    @Param('inviteId') inviteId: number
  )
  {
    return null;
  }

}
