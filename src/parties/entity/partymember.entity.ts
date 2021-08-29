import {UserEntity} from "src/users/entity/user.entity";
import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {PartyEntity} from "./party.entity";

/* XXX: the below enum may be represented by a boolean instead, but it has been done
 * with potential scaling in mind: maybe more roles will be added later
 */

export enum PartyUserRole {
  DEFAULT = 'DEFAULT',
  ADMINISTRATOR = 'ADMIN'
}

export enum PartymemberState {
  INVITATION_PENDING = 'PENDING',
  IN = 'IN',
  OUT = 'OUT',
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
    default: PartymemberState.INVITATION_PENDING
  })
  state: PartymemberState

  @Column({
    default: false
  })
  canUseChat: boolean;

  @Column({
    default: false
  })
  canEditItems: boolean;

  @Column({
    type: 'enum',
    enum: PartyUserRole,
    default: PartyUserRole.DEFAULT
  })
  role: PartyUserRole;
}

