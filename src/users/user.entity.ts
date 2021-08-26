import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

export enum UserState
{
  PENDING_CONFIRMATION = 'PENDING',
  ACTIVATED = 'ACTIVATED',
  DISABLED = 'DISABLED'
}

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  state: UserState
}
