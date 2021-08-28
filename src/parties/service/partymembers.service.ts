import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePartymemberDto } from '../dto/create-partymember.dto';
import { PartymemberEntity } from '../entity/partymember.entity';

@Injectable()
export class PartymembersService {
  constructor(
    @InjectRepository(PartymemberEntity)
    private readonly partymembersRepository: Repository<PartymemberEntity>, 
  ) {}

  async findAll(partyId: number) {
    const members = await this.partymembersRepository.find({
      relations: [ 'party' ],
    }); 

    return members.filter(member => member.party.id === partyId);
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
