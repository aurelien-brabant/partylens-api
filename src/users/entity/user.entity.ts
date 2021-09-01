import {Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {InviteGroupEntity} from "./invitegroup.entity";

export enum UserState
{
  PENDING_CONFIRMATION = 'PENDING',
  ACTIVATED = 'ACTIVATED',
  DISABLED = 'DISABLED'
}

export enum UserRolePrivilege
{
  DEFAULT = 0,
  MODERATOR = 1,
  ADMIN = 10
}

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: "enum",
    enum: UserState,
    default: UserState.PENDING_CONFIRMATION,
    select: false
  })
  state: UserState;

  @Column({
    type: 'enum',
    enum: UserRolePrivilege,
    default: UserRolePrivilege.DEFAULT,
  })
  privilege: number;

  @OneToMany(() => InviteGroupEntity, igrp => igrp.owner)
  invitegroups: InviteGroupEntity[];

  @ManyToMany(() => InviteGroupEntity, igrp => igrp.users, {
    cascade: true
  })
  @JoinTable()
  invitedgroups: InviteGroupEntity[];
}
