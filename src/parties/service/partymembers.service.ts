import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {UserEntity} from 'src/users/entity/user.entity';
import {UsersService} from 'src/users/service/users.service';
import { Repository } from 'typeorm';
import { CreatePartymemberDto } from '../dto/create-partymember.dto';
import {UpdatePartymemberDto} from '../dto/update-partymember.dto';
import { PartymemberEntity, PartymemberState } from '../entity/partymember.entity';

@Injectable()
export class PartymembersService {
  constructor(
    @InjectRepository(PartymemberEntity)
    private readonly partymembersRepository: Repository<PartymemberEntity>, 
    private readonly usersService: UsersService,
  ) {}

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

  async create(partyId: number, memberData: CreatePartymemberDto) {
    const user = await this.usersService.findById(memberData.id);

    if (!user) {
      throw new NotFoundException(`Could not create party member: user with id #${memberData.id} does not exist`);
    }

    const existingMember = await this.partymembersRepository.findOne({
      relations: [ 'party', 'user' ],
      where: {
        user: {
          id: user.id
        }
      }
    });

    if (existingMember && existingMember.party.id === partyId) {
      throw new ConflictException(`Could not add member: user with id #${memberData.id} is already in the party.`);
    }

    delete memberData.id;
    
    const member = this.partymembersRepository.create({
      party: { id: partyId },
      user: { id: user.id  },
      ... memberData
    });

    return this.partymembersRepository.save(member);
  }
  
  /*
   * TODO: authorization
   * Can be used to change member's state, permissions (canUseChat, canEditItems)
   * state and permissions can only be changed by a user which is privileged at the party level.
  */
  async patch(userId: number, partyId: number, memberId: number, attrs: UpdatePartymemberDto) {
    const member = await this.findById(partyId, memberId);

    if (!member) {
      throw new NotFoundException(`Could not update: member with id #${memberId} does not exist for this party.`);
    }

    /* Start of edit state */
    if (attrs.state && member.state !== attrs.state) {
      if (member.state !== PartymemberState.INVITATION_PENDING) {
        throw new BadRequestException('Could not change member state: irrelevant state change');
      }

      switch(attrs.state) {
          /* ACCEPT INVITE */
          case PartymemberState.IN:
            if (userId === member.user.id) {
              member.state = PartymemberState.IN;
            } else {
              throw new UnauthorizedException('Could not change member state: invited user is the only one that can accept the invite!');
            }
            break;
          
          case PartymemberState.OUT:
            if (userId === member.user.id) {
              member.state = PartymemberState.OUT;
            } else {
              throw new UnauthorizedException('Could not change member state: invited user is the only one that can revoke the invite!');
            }
            break;

          /* Throw any other state change */
          default:
            throw new BadRequestException('Could not change member state: irrelevant state change');
        }
      delete attrs.state;
    }
    /* End of edit state */

    Object.assign(member, attrs);
     
    return this.partymembersRepository.save(member);
  }

  async remove(partyId: number, memberId: number): Promise<PartymemberEntity>
  {
    const member = await this.findById(partyId, memberId);
    
    return this.partymembersRepository.remove(member);
  }

  async changeMemberState(userId: number, member: PartymemberEntity, newState: PartymemberState) {
    if (member.state === newState) return ;

    
  }

}


