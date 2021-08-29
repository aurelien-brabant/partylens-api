import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreatePartyItemDto} from '../dto/create-partyitem.dto';
import {UpdatePartyItemDto} from '../dto/update-partyitem.dto';
import {PartyItemEntity} from '../entity/partyitem.entity';
import {PartymembersService} from './partymembers.service';

@Injectable()
export class PartyitemsService {
  constructor(
    @InjectRepository(PartyItemEntity)
    private readonly partyitemsRepository: Repository<PartyItemEntity>,
    private readonly partymembersService: PartymembersService,
  ) {}

  findAll(partyId: number): Promise<PartyItemEntity[]> {
    return this.partyitemsRepository.find({
      where: {
        partyId
      }
    })
  }

  findById(partyId: number, itemId: number): Promise<PartyItemEntity>
  {
    return this.partyitemsRepository.findOne(itemId, {
      where: {
        partyId
      }
    });
  }

  async create(partyId: number, itemData: CreatePartyItemDto): Promise<PartyItemEntity>  {
    const member = await this.partymembersService.findById(partyId, itemData.ownerId);

    if (!member.canEditItems) {
      throw new UnauthorizedException('Member is not permitted to add an item');
    }

    let newItem = this.partyitemsRepository.create({
      ... itemData,
      partyId,
    });

    try {
      newItem = await this.partyitemsRepository.save(newItem);
    } catch(error) {
      if (error?.code === '23505') {
        throw new ConflictException('An item with the same title already exists.');
      }
    }

    return newItem;
  }

  async update(partyId: number, itemId: number, attrs: UpdatePartyItemDto): Promise<PartyItemEntity>
  {
    const item = this.findById(partyId, itemId);

    if (!item) {
      throw new NotFoundException('Could not update party item: no such item in party');
    }
    
    Object.assign(item, attrs);

    
    return null;
  }
}
