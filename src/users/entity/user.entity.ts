import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

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
}
