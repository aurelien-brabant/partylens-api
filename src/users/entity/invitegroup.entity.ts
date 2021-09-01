import {Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "./user.entity";

@Entity()
export class InviteGroupEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true
  })
  label: string;

  @ManyToMany(() => UserEntity, user => user.invitedgroups)
  users: UserEntity[];

  @ManyToOne(() => UserEntity, user => user.invitegroups)
  owner: UserEntity;
}
