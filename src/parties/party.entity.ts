import {UserEntity} from "src/users/user.entity";
import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class PartyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  startDate: Date;

  @Column()
  creationDate: Date;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  owner: UserEntity;
}
