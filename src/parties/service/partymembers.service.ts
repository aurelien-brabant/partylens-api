import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {hasPermissions, MPBit} from 'partylens-permissions';
import {ServiceException} from 'src/misc/serviceexception';
import {UsersService} from 'src/users/service/users.service';
import { Repository } from 'typeorm';
import { CreatePartymemberDto } from '../dto/create-partymember.dto';
import { UpdatePartymemberDto } from '../dto/update-partymember.dto';
import { PartymemberEntity } from '../entity/partymember.entity';
import { PartiesService } from './parties.service';

@Injectable()
export class PartymembersService {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => PartiesService))
    private readonly partiesService: PartiesService,
    @InjectRepository(PartymemberEntity)
    private readonly partymembersRepository: Repository<PartymemberEntity>, 
  ) {}

  /**
  @description Party owner is always present in the party's member list as the first
  member. It must have all the permissions granted and NONE of his fields can be mutated.
  */

  async findAll(partyId: number) {
    const members = await this.partymembersRepository.find({
      relations: [ 'party', 'user' ],
      where: {
        party: {
          id: partyId
        }
      }
    }); 

    return members;
  }

  /* NOTE: memberId !== userId */
  async findById(partyId: number, memberId: number): Promise<PartymemberEntity> {
    const member = await this.partymembersRepository.findOne(
      memberId,
      {
        relations: [ 'party', 'user' ],
        where: {
          party: {
            id: partyId
          }
        }
      }
    )

    return member;
  }

  async findMemberByNametag(nametag: string, partyId: number): Promise<PartymemberEntity> {
    const [ name, tag ] = nametag.split('#');

    const member = await this.partymembersRepository.findOne(
      {
        relations: [ 'party', 'user' ],
        where: {
          party: {
            id: partyId
          },
          user: {
            name,
            tag,
          }
        }
      }
    )

    return member;
  }

  /**
  @description get the member representation of a user inside the given party.

  @param {number} userId identifies a given `UserEntity`
  @param {number} partyId identifies a given `PartyEntity`.
  
  @return {PartymemberEntity} the member if any is found, null otherwise.
  */

  findMemberFromUser(userId: number, partyId: number): Promise<PartymemberEntity> {
    return this.partymembersRepository.findOne({
      where: {
        party: {
          id: partyId
        },
        user: {
          id: userId
        }
      }
    });
  }

  /**
  @description Creates a new member.
  
  @param {number} loggedUserId identifies the currently logged `UserEntity`.
  @param {number} partyId identifies the party in which the member will be added.
  @param {CreatePartymemberDto} memberData the data used to initialize the member.

  @throws {ServiceException}:
  - user could not be retrived using the provided nametag.
  - member already in the party.
  - logged user member representation for the current party could not be found.
  - permission denied while attempting to provide custom permissionBits without the `GRANT_PRIVILEGES` permission.

  @returns {PartymemberEntity} the created member.
  */

  async create(loggedUserId: number, partyId: number, memberData: CreatePartymemberDto) {
    const addedUser = await this.usersService.findByNametag(memberData.nametag);

    if (!addedUser) {
      throw new ServiceException(`Could not find user ${memberData.nametag}`, HttpStatus.NOT_FOUND);
    }

    /* Ensures member is not already in the party */

    let member = await this.findMemberByNametag(memberData.nametag, partyId);
    if (member) {
      throw new ServiceException(`${memberData.nametag} is already a member of this party.`, HttpStatus.CONFLICT);
    }

    delete memberData.nametag; 

    /* Are custom permissionBits allowed? */

    if (memberData.permissionBits !== undefined) {
      const party = await this.partiesService.findById(partyId);

      if (loggedUserId !== party.owner.id) {
        const loggedMember = await this.findMemberFromUser(loggedUserId, partyId);

        if (!loggedMember) {
          throw new ServiceException(`Could not find currently logged user, identified by id(${loggedUserId})`, HttpStatus.NOT_FOUND)
        }

        if (!hasPermissions(loggedMember.permissionBits, MPBit.GRANT_PRIVILEGES)) {
          throw new ServiceException('Permission denied: can\'t grant privileges to a party member.', HttpStatus.UNAUTHORIZED);
        }
      }

    }

    /* Save and create the member */

    return this.partymembersRepository.save(
      this.partymembersRepository.create({
        user: addedUser,
        party: { id: partyId },
        ... memberData
      })
    );
  }
  
  async patch(partyId: number, memberId: number, attrs: UpdatePartymemberDto) {
    const member = await this.findById(partyId, memberId);

    Object.assign(member, attrs);
     
    return this.partymembersRepository.save(member);
  }

  async remove(member: PartymemberEntity): Promise<PartymemberEntity>
  {
    return this.partymembersRepository.remove(member);
  }
}
