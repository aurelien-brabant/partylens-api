import { Injectable,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePartymemberDto } from '../dto/create-partymember.dto';
import { UpdatePartymemberDto } from '../dto/update-partymember.dto';
import { PartymemberEntity } from '../entity/partymember.entity';

@Injectable()
export class PartymembersService {
  constructor(
    @InjectRepository(PartymemberEntity)
    private readonly partymembersRepository: Repository<PartymemberEntity>, 
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

  async findUserById(userId: number, partyId: number): Promise<PartymemberEntity> {
    const member = await this.partymembersRepository.findOne(
      {
        relations: [ 'party', 'user' ],
        where: {
          party: {
            id: partyId
          },
          user: {
            id: userId
          }
        }
      }
    )

    return member;
  }

  async create(partyId: number, memberData: CreatePartymemberDto) {
    const member = this.partymembersRepository.create({
      party: { id: partyId },
      user: { id: memberData.id  },
      ... memberData
    });

    return this.partymembersRepository.save(member);
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
