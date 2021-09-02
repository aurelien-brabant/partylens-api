import {UserEntity} from "src/users/entity/user.entity";
import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {PartymemberEntity} from "./partymember.entity";

@Entity()
export class PartyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  startDate: string;

  @Column({
    default: new Date(Date.now()).toJSON()
  })
  creationDate: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE'
  })
  owner: UserEntity;

  @OneToMany(() => PartymemberEntity, member => member.party)
  members: PartymemberEntity[];

  @Column({
    nullable: true
  })
  latlong: string;

  @Column({
    nullable: true
  })
  locationAka: string;
}
