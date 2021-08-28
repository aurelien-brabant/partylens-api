import {NotFoundException} from '@nestjs/common';
import { Injectable,} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreatePartyDto} from '../dto/create-party.dto';
import {UpdatePartyDto} from '../dto/update-party.dto';
import {PartyEntity} from '../entity/party.entity';
import {PartyUserRole} from '../entity/partymember.entity';
import {PartymembersService} from './partymembers.service';

@Injectable()
export class PartiesService {
  constructor(
    @InjectRepository(PartyEntity)
    private readonly partiesRepository: Repository<PartyEntity>,
    private readonly partymembersService: PartymembersService
  ) {}

  isUserInvolvedInParty(party: PartyEntity, userId: number): boolean
  {
    if (party.owner && userId == party.owner.id) {
      return true;
    }

    /* if any member is the targeted user, then it is involved */

    if (party.members) {
      for (const member of party.members) {
        if (member.user && member.user.id == userId) {
          return true;
        }
      }
    }

    return false;
  }

  /* XXX: does not validate that party belongs to any user: to use in appropriate context */

  async findById(partyId: number): Promise<PartyEntity>
  {
    const party = await this.partiesRepository.findOne(partyId, {
      relations: ['owner']
    })

    if (!party) {
      throw new NotFoundException('No such party');
    }

    return party;
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
      members: [
        {
          id: userId,
          role: PartyUserRole.ADMINISTRATOR
        }
      ],
      owner: { id: userId },
      ... partyData,
    });

    party = await this.partiesRepository.save(party);

    for (const member of party.members) {
      await this.partymembersService.create(party.id, member);
    }

    return party;
  }

  async updateUserParty(
    userId: number,
    partyId: number,
    attrs: UpdatePartyDto
  ): Promise<PartyEntity>
  {
    const party = await this.findUserPartyById(userId, partyId);

    /* push newly provided members all together in the existing array */
    if (attrs.members) {
      for (const member of attrs.members) {
        party.members.push(await this.partymembersService.create(partyId, member));
      }
      delete attrs.members; /* do not REPLACE old array with the new one */
    }

    Object.assign(party, attrs);

    return await this.partiesRepository.save(party);
  }

  async deleteUserParty(userId: number, partyId: number): Promise<PartyEntity>
  {
    const party = await this.findUserPartyById(userId, partyId);

    /* Remove all the member objects attached to the party, to avoid foreign key violation */
    for (const member of party.members) {
      await this.partymembersService.remove(partyId, member.id)
    }
    
    return this.partiesRepository.remove(party);
  }
}
