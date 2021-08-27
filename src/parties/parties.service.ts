import {NotFoundException, UseGuards} from '@nestjs/common';
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

  isUserInvolvedInParty(party: PartyEntity, userId: number): boolean
  {
    console.log(party);
    if (party.owner && userId === party.owner.id) {
      return true;
    }

    /* if any member is the targeted user, then it is involved */

    if (party.members) {
      for (const member of party.members) {
        if (member.user && member.user.id === userId) {
          return true;
        }
      }
    }

    return false;
  }

  async findUserPartyById(userId: number, partyId: number): Promise<PartyEntity>
  {
    const party = await this.partiesRepository.findOne(partyId, {
      relations: ['members', 'owner']
    });

    if (!party || !this.isUserInvolvedInParty(party, userId)) {
      throw new NotFoundException('No such party');
    }

    return party;
  }

  /* only return parties the user participates to */
  async findPartiesForUser(
    userId: number,                      
    options: {
      populateMembers: boolean, /* populate_members */
      strictPartyMatching?: boolean  /* strict_party_matching */
    }
  ): Promise<PartyEntity[]> 
  {
    const relations = ['owner']; /* owner population is always needed anyway */

    if (options.populateMembers) {
      relations.push('members', 'members.user');
    }

    const parties = await this.partiesRepository.find({
      relations,
    })

    return parties.filter(party => !options.populateMembers || options.strictPartyMatching ?
                          party.owner.id === userId : this.isUserInvolvedInParty(party, userId));
  }

  async create(userId: number, partyData: CreatePartyDto) {
    let party = this.partiesRepository.create({
      ... partyData,
      owner: { id: userId }
    });

    party = await this.partiesRepository.save(party);

    for (const member of partyData.members) {
      await this.partymembersService.create(party.id, { id: member.id, canUseChat: member.canUseChat, canEditItems: member.canEditItems });
    }

    return party;
  }

}
