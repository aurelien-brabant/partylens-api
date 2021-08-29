import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class PartyItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true
  })
  title: string;

  @Column({
    nullable: true,
    default: null
  })
  description?: string | null;
  
  /**
   * Id of the PartymemberEntity that made this item proposal
   */
  @Column()
  ownerId: number;

  /**
   * Id of the PartyEntity that this item proposal is related to
   */
  @Column()
  partyId: number;

  /**
   * The quantity of this item which is needed to complete the proposal
   */
  @Column()
  amountGoal: number;
}
