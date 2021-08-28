import {UserEntity} from "src/users/entity/user.entity";
import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {PartyEntity} from "./party.entity";

/* XXX: the below enum may be represented by a boolean instead, but it has been done
 * with potential scaling in mind: maybe more roles will be added later
 */

export enum PartyUserRole {
  DEFAULT = 0,
  ADMINISTRATOR = 10
}

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

  @Column({
    type: 'enum',
    enum: PartyUserRole,
    default: PartyUserRole.DEFAULT
  })
  role: PartyUserRole
}

