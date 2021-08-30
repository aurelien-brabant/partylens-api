import {NotFoundException, UnauthorizedException} from '@nestjs/common';
import { Injectable,} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreatePartyDto} from '../dto/create-party.dto';
import {UpdatePartyDto} from '../dto/update-party.dto';
import {PartyEntity} from '../entity/party.entity';
import {PartymemberState, PartyUserRole} from '../entity/partymember.entity';
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

    return party;
  }

  findAll(): Promise<PartyEntity[]> {
    return this.partiesRepository.find();
  }

  async findUserPartyById(
    userId: number,
    partyId: number, 
    notFoundThrowCallback?: () => string
  ): Promise<PartyEntity>
  {
    const party = await this.partiesRepository.findOne(partyId, {
      relations: ['members', 'members.user', 'owner']
    });

    if (!party || !this.isUserInvolvedInParty(party, userId)) {
      if (notFoundThrowCallback) {
         throw new NotFoundException(notFoundThrowCallback());
      }
      return null;
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

  async create(ownerId: number, partyData: CreatePartyDto) {
    const { members, ...remainingData } = partyData;

    console.log(ownerId);

    let party = this.partiesRepository.create({
      owner: { id: ownerId },
      members: [],
      ... remainingData
    });

    /* save for a first time to get the id of the new entry */
    party = await this.partiesRepository.save(party);

    /* create member representation for owner, making it party admin by default */
    party.members.push(await this.partymembersService.create(party.id, {
        id: ownerId,
        role: PartyUserRole.ADMIN,
        canUseChat: true,
        canEditItems: true,
      })
    );

    /* append to the member list (that contains only the owner at this point) all the specified members, if any */
    if (members) {
      for (const member of members) {
        party.members.push(await this.partymembersService.create(party.id, member));
      }
    }

    return this.partiesRepository.save(party);
  }

  async updateUserParty(
    userId: number,
    partyId: number,
    attrs: UpdatePartyDto
  ): Promise<PartyEntity>
  {
    const party = await this.findUserPartyById(userId, partyId, () => 'Could not update: not found');

    if (attrs.members) {
      for (const member of attrs.members) {
        party.members.push(await this.partymembersService.create(partyId, member));
      }
      delete attrs.members;
    }

    Object.assign(party, attrs);

    return await this.partiesRepository.save(party);
  }

  async deleteUserParty(userId: number, partyId: number): Promise<PartyEntity>
  {
    const party = await this.findUserPartyById(userId, partyId,
                                               () => `Could not delete party: party with id ${partyId} does not exist for that user.`);
    if (party.owner.id !== userId) {
      throw new UnauthorizedException('Could not delete party: permission denied: member but not owner');
    }

    for (const member of party.members) {
      await this.partymembersService.remove(member)
    }
    
    return this.partiesRepository.remove(party);
  }
}
