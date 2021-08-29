import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {PartymemberEntity} from "./partymember.entity";

@Entity()
export class PartyItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;
  
  /**
   * Relates to the PartymemberEntity that did this item proposal
   */
  @ManyToOne((() => PartymemberEntity))
  owner: PartymemberEntity;

  /**
   * The quantity of this item which is needed to complete the proposal
   */
  @Column()
  amountGoal: number;
}
