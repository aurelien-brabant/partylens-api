import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {PartyItemEntity} from "./partyitem.entity";
import {PartymemberEntity} from "./partymember.entity";

@Entity()
export class PartyItemParticipationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Relates to the party member that has contributed to the item proposal.
   */
  @ManyToOne(() => PartymemberEntity)
  owner: PartymemberEntity;

  /**
   * Relates to the party item this participation is associated with
   */
  @ManyToOne(() => PartyItemEntity)
  item: PartyItemEntity;

  /**
   * The amount of the given item bringed by the member
   */
  @Column()
  amount: number;
}
