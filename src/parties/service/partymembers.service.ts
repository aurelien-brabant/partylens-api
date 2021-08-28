import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

    if (!member) {
      throw new NotFoundException('No such member in party');
    }

    return member;
  }

  async create(partyId: number, memberData: CreatePartymemberDto) {
    const user = await this.usersService.findById(memberData.id);

    const existingMember = await this.partymembersRepository.findOne({
      relations: [ 'party', 'user' ],
      where: {
        user: {
          id: user.id
        }
      }
    });

    if (existingMember && existingMember.party.id === partyId) {
      throw new ConflictException('User already in party');
    }

    const member = this.partymembersRepository.create({
      party: { id: partyId },
      user: { id: user.id  },
    });

    return this.partymembersRepository.save(member);
  }
  
  /*
   * TODO: authorization
   * Can be used to change member's state, permissions (canUseChat, canEditItems)
   * state and permissions can only be changed by a user which is privileged at the party level.
  */
  async patch(partyId: number, memberId: number, attrs: UpdatePartymemberDto) {
    const member = await this.findById(partyId, memberId);

    Object.assign(member, attrs);
     
    return this.partymembersRepository.save(member);
  }

  async remove(partyId: number, memberId: number): Promise<PartymemberEntity>
  {
    const member = await this.findById(partyId, memberId);
    
    return this.partymembersRepository.remove(member);
  }

}
