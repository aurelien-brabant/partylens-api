import {UserEntity} from "src/users/entity/user.entity";
import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {PartyEntity} from "./party.entity";

/* XXX: the below enum may be represented by a boolean instead, but it has been done
 * with potential scaling in mind: maybe more roles will be added later
 */

export enum PartyUserRole {
  DEFAULT = 'DEFAULT',
  ADMIN = 'ADMIN',
}

export enum MPBit {
  INVITE = 1 << 0,
  EDIT_ITEMS = 1 << 1,
  CHAT_WR = 1 << 2,
  CHAT_RD = 1 << 3,
  KICK = 1 << 4,
  GRANT_PRIVILEGES = 1 << 5
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
    default: 0
  })
  permissionBits: number;
}

