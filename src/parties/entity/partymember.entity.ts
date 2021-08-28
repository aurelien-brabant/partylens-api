import {UserEntity} from "src/users/user.entity";
import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {PartyEntity} from "./party.entity";

export enum PartymemberState {
  PENDING = -1,
  OUT = 0,
  IN = 1,
}

@Entity()
export class PartymemberEntity
{
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => PartyEntity, party => party.members)
  party: PartyEntity;

  @Column({
    type: 'enum',
    enum: PartymemberState,
    default: PartymemberState.PENDING
  })
  state: PartymemberState

  @Column({
    default: true
  })
  canUseChat: boolean;

  @Column({
    default: true
  })
  canEditItems: boolean;
}

