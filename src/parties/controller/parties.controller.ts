import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request, Query, NotFoundException } from '@nestjs/common';
import {ApiBearerAuth, ApiNotFoundResponse, ApiQuery, ApiTags} from '@nestjs/swagger';
import {JwtAuthGuard} from 'src/auth/guard/jwt-auth.guard';
import {ServiceException} from 'src/misc/serviceexception';
import {CreatePartyDto} from '../dto/create-party.dto';
import {UpdatePartyDto} from '../dto/update-party.dto';
import {PartyEntity} from '../entity/party.entity';
import {PartiesService} from '../service/parties.service';

@ApiTags('Party management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/parties')
export class PartiesController {
  constructor(
    private readonly partiesService: PartiesService
  ) { }

  /**
   * Returns all the parties the user is involved into.
   * By default, for a normal user, that means any party it owns or is a member of.
   */

  @Get('/')
  findAll(
    @Request() req: any,
  )
  {
    return this.partiesService.findPartiesForUser(req.user.id);
  }

  /**
   * Get a specific party the current user is involved into, given its id.
   */
  
  @ApiNotFoundResponse({
    description: 'Party could not be found for that user'
  })

  @Get('/:partyId')
  async findOne(
    @Request() req: any,
    @Param('partyId') partyId: number
  ): Promise<PartyEntity>
  {
    const party = await this.partiesService.findUserPartyById(req.user.id, partyId);

    if (!party.id) {
      throw new NotFoundException(`Could not find party with id ${partyId} for that user.`);
    }

    return party;
  }

  /**
   * Create a new party for the currently logged in user.
   */

  @ApiNotFoundResponse({
    description: 'At least one member in the members array refers to a non existing user.' 
  })

  @Post('/')
  async create(
    @Request() req: any,
    @Body() partyData: CreatePartyDto
  )
  {
    try {
      return await this.partiesService.create(req.user.id, partyData);
    } catch(error) {
      if (error instanceof ServiceException) {
        error.throwAsHttpException();
      }
    }
  }

  /**
   * Update a party given its `id`.
   * 
   * **IMPORTANT NOTE**: when providing an array of members in the request, this array *WON'T*
   * replace the old one: each member in it will be appended to the current one. This offers
   * an easy way to add a group of users in one single API call.
   */

  @Patch('/:partyId')
  async editUserParty(
    @Request() req: any,
    @Param('partyId') partyId: number,
    @Body() attrs: UpdatePartyDto,
  )
  {
    try {
      return await this.partiesService.updateUserParty(req.user.id, partyId, attrs);
    } catch(error) {
      if (error instanceof ServiceException) {
        error.throwAsHttpException();
      }
    }
  }

  /**
   * Delete a party given its `id`, and all the data associated with it such as items, members, and so on.
   *
   * **This is a destructive and irreversible action**.
   */

  @Delete('/:partyId')
  async deleteParty(
    @Request() req: any,
    @Param('partyId') partyId: number,
  )
  {
    try {
      return await this.partiesService.deleteUserParty(req.user.id, partyId);
    } catch(error) {
      if (error instanceof ServiceException) {
        error.throwAsHttpException();
      }
    }
  }

}
