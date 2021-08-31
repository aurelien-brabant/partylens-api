import {Delete} from '@nestjs/common';
import { Body, ConflictException, Controller, Get, NotFoundException, Param, Patch, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import {ApiBearerAuth, ApiConflictResponse, ApiNotFoundResponse, ApiTags, ApiUnauthorizedResponse} from '@nestjs/swagger';
import {JwtAuthGuard} from 'src/auth/guard/jwt-auth.guard';
import {CreatePartyItemDto} from '../dto/create-partyitem.dto';
import {UpdatePartyItemDto} from '../dto/update-partyitem.dto';
import {MPBit} from '../entity/partymember.entity';
import {MemberPermissionGuard} from '../guard/memberpermission.guard';
import {PartyExistsGuard} from '../guard/party-exists.guard';
import {PartyitemsService} from '../service/partyitems.service';
import {PartymembersService} from '../service/partymembers.service';

@ApiBearerAuth()
@ApiTags('Party management')
@UseGuards(JwtAuthGuard, PartyExistsGuard)
@Controller('/parties/:partyId/items')
export class PartyitemsController {
  constructor(
    private readonly partyitemsService: PartyitemsService,
    private readonly partymembersService: PartymembersService,
  ) {}

  /**
   * Find all the items that are related to a given party
   */

  @Get('/')
  findAll(
    @Param('partyId') partyId: number
  )
  {
    return this.partyitemsService.findAll(partyId);
  }

  /**
   * # Permission guard: `ITEM_CREATE`
   *
   * Create a new item for a given party.
   *
   * This item must have an amount `n` such as `0 < n < 100`.
   *
   * By default an item has no participations, participations are added
   * by POSTing `/parties/:id/items/:id/participations` route.
   */

  @ApiUnauthorizedResponse({
    description: 'Logged member missing `ITEM_CREATE` permission.'
  })

  @ApiConflictResponse({
    description: 'Item with the exact same label (case sensitive) already exist'
  })

  @UseGuards(MemberPermissionGuard(MPBit.ITEM_CREATE))
  @Post('/')
  create(
    @Param('partyId') partyId: number,
    @Body() itemData: CreatePartyItemDto,
    @Request() req: any,
  )
  {
    try {
      return this.partyitemsService.create(req.user.id, partyId, itemData);
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  /**
   * Get caracteristics of an item, given its `id`.
   */

  @ApiNotFoundResponse({
    description: 'Item could not be found'
  })

  @Get('/:itemId')
  async findOne(
    @Param('partyId') partyId: number,
    @Param('itemId') itemId: number
  ) {
    const item = await this.partyitemsService.findById(partyId, itemId)
    
    if (!item) {
      throw new NotFoundException('Could not get: item not found for that party');
    }

    return item;
  }

  /**
   * Edit basic properties of an item.
   *
   * Participations are edited by PUTing to `/parties/:id/items/:id/participations/:id`.
   */

  @ApiNotFoundResponse({
    description: 'Item could not be found'
  })

  @ApiUnauthorizedResponse({
    description: 'Item is not owned by the logged member or missing `ITEM_EDIT` permission.'
  })

  @Patch('/:itemId')
  async update(
    @Request() req: any,
    @Param('partyId') partyId: number,
    @Param('itemId') itemId: number,
    @Body() attrs: UpdatePartyItemDto,
  )
  {
    const item = await this.partyitemsService.findById(partyId, itemId);
    
    if (!item) {
      throw new NotFoundException('Could not get: item not found for that party');
    }

    if (item.owner.id !== req.user.id &&
      !this.partymembersService.hasPermission(item.owner, MPBit.ITEM_EDIT)) {
      throw new UnauthorizedException('Could not update: permission denied.');
    }

    return this.partyitemsService.update(item, attrs);
  }

  /**
   * Delete an item for a given party.
   *
   * This is a *destructive and permanent* operation. Participations to this item
   * will be lost too.
   */

  @ApiNotFoundResponse({
    description: 'Item could not be found'
  })
  
  @ApiUnauthorizedResponse({
    description: 'Item is not owned by the logged member or missing `ITEM_DELETE` permission.'
  })

  @Delete('/:itemId')
  async remove(
    @Request() req: any,
    @Param('partyId') partyId: number,
    @Param('itemId') itemId: number,
  )
  {
    const item = await this.partyitemsService.findById(partyId, itemId);
    
    if (!item) {
      throw new NotFoundException('Could not get: item not found for that party');
    }

    if (item.owner.id !== req.user.id &&
      !this.partymembersService.hasPermission(item.owner, MPBit.ITEM_DELETE)) {
      throw new UnauthorizedException('Could not update: permission denied.');
    }

    return this.partyitemsService.remove(item);
  }

}
