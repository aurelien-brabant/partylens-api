import { Body, Injectable, Param } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreatePartymemberDto} from './dtos/create-partymember.dto';
import {PartymemberEntity, PartymemberState} from './partymember.entity';

/* Route: /users/:userId/parties/:partyId/members */

@Injectable()
export class PartymembersService {
  constructor(
    @InjectRepository(PartymemberEntity)
    private readonly partymembersRepository: Repository<PartymemberEntity>,
  ) {}

  findAll(partyId: number) {
    return this.partymembersRepository.find({
      relations: [ 'party' ],
      where: {
        'party.id': partyId
      }
    }); 
  }

  async create(partyId: number, memberData: CreatePartymemberDto) {
    const existingMember = await this.partymembersRepository.findOne(memberData.id, {
      relations: [ 'party' ]
    });

    /* If member is already in the party, fail silently, no need to throw an error as it would be a common error scenario */
    if (existingMember && existingMember.party.id === partyId) {
      console.warn(`User #${existingMember.id} can't be added to party #${partyId}: already present.`)
      return null;
    }

    console.log("userid", memberData);
    const member = this.partymembersRepository.create({
      party: { id: partyId },
      user: { id: memberData.id },
    });

    return this.partymembersRepository.save(member);
  }
}
