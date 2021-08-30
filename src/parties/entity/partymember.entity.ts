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
  MEMBER_INVITE = 1 << 0,
  MEMBER_KICK = 1 << 1,
  CHAT_WR = 1 << 2,
  CHAT_RD = 1 << 3,
  GRANT_PRIVILEGES = 1 << 4,
  ITEM_CREATE = 1 << 5,
  ITEM_ADD = 1 << 6,
  ITEM_DELETE = 1 << 7,
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

  /**
   * A number holding a collection of bits, each one being associated with a single permission.
   * 
   * **By default**, `permissionBits` is initialized to 0 (meaning no permission AT ALL). It is the responsability of the API caller
   * to attribute appropriate permissions.
   * 
   * However, **owner**'s `permissionBits` is always intialized to `~0` (meaning all the permissions are granted). As owner member is immutable,
   * this is not possible to edit its `permissionBits`.
   * 
   * ## Permission list
   * 
   * `MEMBER_INVITE = 1 << 0`
   * 
   * If set, party member is able to invite users to join the party.
   * 
   * `MEMBER_KICK = 1 << 1`
   * 
   * If set, party member can kick (i.e delete) another member from the party. This is a destructive and permanent action.
   * 
   * `CHAT_WR = 1 << 2`
   * 
   * If set, party member can write to the party chat, which implies that `CHAT_RD` is set too.
   * 
   * `CHAT_RD = 1 << 3`
   * 
   * If set, party member can read the party chat. If `CHAT_WR` is not set, then chat is read-only for that member.
   * 
   * `GRANT_PRIVILEGES = 1 << 4`
   * 
   * If set, party member can grant any permission to any member, including himself (if not the owner - who is immutable). This is
   * obviously a dangerous permission to grant. Most of the time this is only useful for the owner, and it should be avoided.
   *
   * `ITEM_CREATE = 1 << 5`
   * 
   * If set, party member can create a new party item. Every party item can be deleted and incremented by the member that created it,
   * however for items created by others a set of specific permissions described below must be granted.
   * 
   * `ITEM_ADD = 1 << 6`
   * 
   * If set, party member can increment *any* party item created by *any* member.
   * 
   * `ITEM_DELETE = 1 << 7`
   * 
   * If set, party member can delete *any* party item created by *any* member. Usually dangerous to grant.
   */
  
  @Column({
    default: 0
  })
  permissionBits: number;
}

