import { Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {PartyEntity} from './party.entity';

@Injectable()
export class PartiesService {
  constructor(
    @InjectRepository(PartyEntity)
    private readonly partiesRepository: Repository<PartyEntity>
  ) {}

  /* only return parties the user participates to */
  findPartiesForUser(userId: number): Promise<PartyEntity[]> {
    return this.partiesRepository.find({
      relations: ['owner'],
      where: {
        'owner.id': userId
      }
    })
  }
}
