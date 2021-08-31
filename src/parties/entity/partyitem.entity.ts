import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {PartyEntity} from "./party.entity";
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

  @Column()
  amountGoal: number;
}
