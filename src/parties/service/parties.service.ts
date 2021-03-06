import {forwardRef, HttpStatus, Inject} from '@nestjs/common';
import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreatePartyDto} from '../dto/create-party.dto';
import {UpdatePartyDto} from '../dto/update-party.dto';
import {PartyEntity} from '../entity/party.entity';
import { hasPermissions, MPBit } from 'partylens-permissions';
import {PartymembersService} from './partymembers.service';
import { UsersService } from '../../users/service/users.service';
import { ServiceException } from '../../misc/serviceexception';

@Injectable()
export class PartiesService {
  constructor(
    @InjectRepository(PartyEntity)
    private readonly partiesRepository: Repository<PartyEntity>,
    @Inject(forwardRef(() => PartymembersService))
    private readonly partymembersService: PartymembersService,
    private readonly usersService: UsersService
  ) {}



  /**
   * TODO: what this function does should probably be achieved using the right
   * PostgreSQL query. However for now parties are filtered using a dirty and unoptimized javascript filter.
   * See `findUserPartyById` and `findPartiesForUser`.
   *
   * @description determines whether or not a user is "involved" in a party. A user is considered
   * as "involved in" if he's either the owner of the party or one of its members.
   *
   * @param PartyEntity the `PartyEntity` we're checking if a user is involved into. It must be a complete
   * `PartyEntity` directly fetched from the DB.
   *
   * @return boolean true if user is involved into the party, false otherwise. If the `members` field of
   * the passed party has not been populated, true is returned only if user is the owner.
   */

  isUserInvolvedInParty(party: PartyEntity, userId: number): boolean
  {
    if (party.owner && userId == party.owner.id) {
      return true;
    }

    if (party.members) {
      for (const member of party.members) {
        if (member.user && member.user.id == userId) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * @description Find a party by id as it is in the DB without any other consideration. Most of the time
   * `findUserPartyById` is wanted instead.
   *
   * @param number the id of the party to find.
   *
   * @return PartyEntity the party if found, null otherwise.
   */

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

  /**
   * @description Find a `PartyEntity` by id where the specified user is involved to.
   *
   * @param number the id of the user.
   * @param number the id of the party.
   *
   * @return PartyEntity the pary if found, null otherwise.
   */

  async findUserPartyById(
    userId: number,
    partyId: number, 
  ): Promise<PartyEntity>
  {
    const party = await this.partiesRepository.findOne(partyId, {
      relations: ['members', 'members.user', 'owner']
    });

    if (!party || !this.isUserInvolvedInParty(party, userId)) {
      return null;
    }

    return party;
  }

  /**
   * Finds a particular party by id, while veryfing that the given user is involved into it.
   * The verification is done by providing the user's nametag, which is then resolved to an actual
   * `UserEntity`.
   *
   * @param {string} the nametag of the user that is (supposedly) involved into the party `partyId` refers to.
   * @param {number} the standard database identifier of the party.
   *
   * @return {PartyEntity} the `PartyEntity`, or null if not found.
   */

  async findUserPartyByNametag(
    userNametag: string,
    partyId: number
  ): Promise<PartyEntity>
  {
    const party = await this.partiesRepository.findOne(partyId, {
      relations: ['members', 'members.user', 'owner'],
    });

    if (!party) return null;

    const user = await this.usersService.findByNametag(userNametag);

    if (!user) return null;

    return this.isUserInvolvedInParty(party, user.id) ? party : null;
  }

  /**
   * @description Fetches all the parties the specified user is involved into.
   *
   * @param number the id of the user.
   *
   * @return PartyEntity[] the list of parties the user is involved into. If there is no match,
   * the array is empty.
   */

  async findPartiesForUser(
    userId: number,       
  ): Promise<PartyEntity[]> 
  {
    return (await this.partiesRepository.find({
      relations: ['members', 'members.user', 'owner']
    })).filter((party) => this.isUserInvolvedInParty(party, userId));
  }

  /**
   * @description creates a new Party
   *
   * @param number Identifies the `UserEntity` that creates the party.
   * @param CreatePartyDto the data used to initialize the new `PartyEntity`.
   * NOTE: for ease of use, it is possible to directly provide an array of members that will be used
   * to intialize the first members of a party.
   * These members are created using the `create` facility from the `PartyMemberService`, thus no cascading
   * is required here.
   *
   * @return - the created party. A ServiceException should be thrown if any error
   * occurs.
   */ 

  async create(
    ownerId: number,
    partyData: CreatePartyDto
  ): Promise<PartyEntity>
  { 
    const owner = await this.usersService.findById(ownerId);

    if (!owner) {
      throw new ServiceException(`Owner of the party identified by id(${ownerId}) could not be found.`);
    }

    const { members, ...remainingData } = partyData;

    let party = this.partiesRepository.create({
      owner: { id: ownerId },
      members: [],
      ... remainingData
    });

    /* save for a first time to get the id of the new entry */
    party = await this.partiesRepository.save(party);

    party.members.push(await this.partymembersService.create(ownerId, party.id, {
        nametag: `${owner.name}#${owner.tag}`,
        permissionBits: ~0,
      })
    );

    /* append to the member list (that contains only the owner at this point) all the specified members, if any */
    if (members) {
      for (const member of members) {
        party.members.push(await this.partymembersService.create(ownerId, party.id, member));
      }
    }

    return this.partiesRepository.save(party);
  }

  /**
   * @description updates a party.
   *
   * @param ownerId identifies the `UserEntity` that owns the party that is going to be deleted.
   * @param partyId identifies the `PartyEntity` that is going to be deleted. ServiceException is thrown if invalid.
   * @param attrs the attributes of the party that are edited. As `createUserParty` does, `updateUserParty` accepts a member initializer
   * under the form of an array. In this case, new members are **ADDED** to the existing list of members (why? Because it makes sense.)
   * Their initialization is also done using the `PartyMemberService`.
   *
   * @return - the `PartyEntity` that has been successfully edited.
   */

  async updateUserParty(
    ownerId: number,
    partyId: number,
    attrs: UpdatePartyDto
  ): Promise<PartyEntity>
  {
    const party = await this.findUserPartyById(ownerId, partyId);

    if (!party) {
      throw new ServiceException(`Could not found party with id ${partyId} for that user.`, HttpStatus.NOT_FOUND);
    } 

    const member = await this.partymembersService.findMemberFromUser(ownerId, partyId);

    if (!member) {
      throw new ServiceException(`Member with id ${ownerId} could not be found for that party.`);
    }

    if ((attrs.locationAka !== undefined
      || attrs.latlong !== undefined
      || attrs.name !== undefined
      || attrs.description !== undefined
    ) && !hasPermissions(member.permissionBits, MPBit.METADATA_EDIT) ) {
      throw new ServiceException(`Permission denied: can't edit party's metadata`);
    }

    if (attrs.members !== undefined) {

      if (!hasPermissions(member.permissionBits, MPBit.MEMBER_GROUP_INVITE)) {
        throw new ServiceException(`Permission denied: can't invite a group of users to the party.`);
      }

      for (const member of attrs.members) {
        party.members.push(await this.partymembersService.create(ownerId, partyId, member));
      }

      delete attrs.members;
    }

    Object.assign(party, attrs);

    return await this.partiesRepository.save(party);
  }

  /**
   * @description Delete a party.
   * 
   * @param number identifies the `UserEntity` that owns the party that is going to be deleted.
   * @param number identifies the `PartyEntity` that is going to be deleted. ServiceException is thrown if invalid.
   *
   * @return - the `PartyEntity` that has been successfully deleted.
   */

  async deleteUserParty(
    ownerId: number,
    partyId: number
  ): Promise<PartyEntity>
  {
    const party = await this.findUserPartyById(ownerId, partyId);

    if (!party) {
      throw new ServiceException(`could not found party with id ${partyId} for that user.`, HttpStatus.NOT_FOUND);
    }

    if (party.owner.id !== ownerId) {
      throw new ServiceException('Only the owner of a party is able to delete it.', HttpStatus.UNAUTHORIZED);
    }
    
    return this.partiesRepository.remove(party);
  }
}
