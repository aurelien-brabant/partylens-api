import { HttpStatus, Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import { ServiceException } from '../../misc/serviceexception';
import {CreatePartyItemDto} from '../dto/create-partyitem.dto';
import {UpdatePartyItemDto} from '../dto/update-partyitem.dto';
import {PartyItemEntity} from '../entity/partyitem.entity';
import {PartyitemparticipationsService} from './partyitemparticipations.service';

@Injectable()
export class PartyitemsService {
  constructor(
    @InjectRepository(PartyItemEntity)
    private readonly partyitemsRepository: Repository<PartyItemEntity>,
    private readonly participationsService: PartyitemparticipationsService
  ) {}

  findAll(partyId: number): Promise<PartyItemEntity[]> {
    return this.partyitemsRepository.find({
      relations: ['owner', 'participations', 'participations.owner', 'participations.owner.user'],
      where: {
        party: {
          id: partyId
        }
      }
    })
  }

  findById(partyId: number, itemId: number): Promise<PartyItemEntity>
  {
    return this.partyitemsRepository.findOne(itemId, {
      relations: ['party', 'owner', 'participations', 'participations.owner', 'participations.owner.user' ],
      where: {
        party: {
          id: partyId
        }
      }
    });
  }

  async create(userId: number, partyId: number, itemData: CreatePartyItemDto): Promise<PartyItemEntity>  {
    let newItem = this.partyitemsRepository.create({
      ... itemData,
      party: { id: partyId },
      owner: { id: userId }
    });

    try {
      newItem = await this.partyitemsRepository.save(newItem);
    } catch(error) {
      if (error?.code === '23505') {
        throw new ServiceException('An item with the same title already exists.', HttpStatus.CONFLICT);
      }
    }

    return newItem;
  }

  update(item: PartyItemEntity, attrs: UpdatePartyItemDto): Promise<PartyItemEntity>
  {
    Object.assign(item, attrs);

    return this.partyitemsRepository.save(item);
  }

  remove(item: PartyItemEntity): Promise<PartyItemEntity>
  {
    for (const participation of item.participations) {
      this.participationsService.removeOne(item.id, participation.id);
    }

    return this.partyitemsRepository.remove(item);
  }
}
