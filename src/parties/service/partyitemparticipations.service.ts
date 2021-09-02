import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CreatePartyItemParticipationDto} from "../dto/create-party-item-participation.dto";
import {PartyItemParticipationEntity} from "../entity/partyitemparticipation.entity";

@Injectable()
export class PartyitemparticipationsService {
  constructor(
    @InjectRepository(PartyItemParticipationEntity)
    private readonly participationRepo: Repository<PartyItemParticipationEntity>
  ) {}

  findAll(): Promise<PartyItemParticipationEntity[]> {
    return this.participationRepo.find({
      relations: [ 'item' ]
    });
  }

  findById(itemId: number, participationId: number): Promise<PartyItemParticipationEntity>
  {
    return this.participationRepo.findOne(participationId, {
      relations: [ 'item', 'owner' ],
      where: {
        item: {
          id: itemId,
        }
      }
    });
  }

  /**
   * NOTE: ownerId must refer to a PartymemberEntity
   */

  async create(ownerId: number, itemId: number, participationData: CreatePartyItemParticipationDto) {
    let participation = await this.participationRepo.findOne({
      relations: [ 'owner' ],
      where: {
        owner: {
          id: ownerId
        }
      }
    });

    if (participation) {
      Object.assign(participation, participationData);
    } else {
      participation = this.participationRepo.create({
        ... participationData,
        item: { id: itemId },
        owner: { id: ownerId }
      });
    }

    return this.participationRepo.save(participation);
  }

  /**
   * Return null if participationId could not be found
   */

  async removeOne(itemId: number, participationId: number): Promise<PartyItemParticipationEntity> {
    const participation = await this.findById(itemId, participationId);

    return participation ? this.participationRepo.remove(participation) : null;
  }

}
