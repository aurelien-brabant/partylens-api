import {UseGuards} from '@nestjs/common';
import { Injectable, Query } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {PartymembersService} from 'src/partymembers/partymembers.service';
import {UserExistsGuard} from 'src/users/user-exists.guard';
import {Repository} from 'typeorm';
import {CreatePartyDto} from './dto/create-party.dto';
import {PartyEntity} from './party.entity';

@Injectable()
export class PartiesService {
  constructor(
    @InjectRepository(PartyEntity)
    private readonly partiesRepository: Repository<PartyEntity>,
    private readonly partymembersService: PartymembersService
  ) {}

  /* only return parties the user participates to */
  async findPartiesForUser(userId: number, entityToPopulate: string[] | null): Promise<PartyEntity[]> {
    /* build a conditional list of relations */

    const relations: string[] = [];

    if (entityToPopulate) {
      if (entityToPopulate.includes('members')) {
        relations.push('members', 'members.user');
      }

      if (entityToPopulate.includes('owner')) {
        relations.push('owner');
      }
    }
  

    const parties = await this.partiesRepository.find({
      relations,
    })

    return parties;
    //return parties.filter(party => party.owner.id === userId);
  }

  async create(userId: number, partyData: CreatePartyDto) {
    let party = this.partiesRepository.create({
      ... partyData,
      owner: { id: userId }
    });

    console.log(partyData);

    party = await this.partiesRepository.save(party);

    for (const member of partyData.members) {
      await this.partymembersService.create(party.id, { id: member.id, canUseChat: member.canUseChat, canEditItems: member.canEditItems });
    }

    return party;
  }

}
