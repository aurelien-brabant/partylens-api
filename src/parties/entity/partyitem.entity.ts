import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {PartyEntity} from "./party.entity";
import {PartyItemParticipationEntity} from "./partyitemparticipation.entity";
import {PartymemberEntity} from "./partymember.entity";

@Entity()
export class PartyItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true
  })
  label: string;

  @Column({
    nullable: true,
    default: null
  })
  description?: string | null;
  
  @ManyToOne(() => PartymemberEntity)
  owner: PartymemberEntity;

  @ManyToOne(() => PartyEntity)
  party: PartyEntity;

  @OneToMany(() => PartyItemParticipationEntity, participation => participation.item)
  participations: PartyItemParticipationEntity[];

  @Column()
  amountGoal: number;
}
