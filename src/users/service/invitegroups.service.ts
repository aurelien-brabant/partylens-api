import {HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {ServiceException} from "src/misc/serviceexception";
import {Repository} from "typeorm";
import {InviteGroupEntity} from "../entity/invitegroup.entity";
import {UserEntity} from "../entity/user.entity";
import {UsersService} from "./users.service";

@Injectable()
export class InviteGroupsService {
  private readonly MAX_GROUP_COUNT = 8;
  
  constructor(
    @InjectRepository(InviteGroupEntity)
    private readonly inviteGroupRepo: Repository<InviteGroupEntity>,
    private readonly usersService: UsersService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>
  ) {};

  /**
   * Find all the invite groups related to a given user,
   *
   * @param uid the id of the user.
   *
   * @return an array that contains all the invite groups the user has.
   * An empty array is returned if there is none.
   */

  findAll(uid: number): Promise<InviteGroupEntity[]>
  {
    return this.inviteGroupRepo.find({
      relations: [ 'users', 'owner' ],
      where: {
        owner: {
          id: uid
        }
      }
    });
  }

  /**
   * Find an InviteGroupEntity for a specific user.
   *
   * @param uid the id of the user
   * @param gid the id of the invite group to find.
   *
   * @return the invite group if found, null otherwise.
   */

  findById(uid: number, gid: number): Promise<InviteGroupEntity>
  {
    return this.inviteGroupRepo.findOne(gid, {
      relations: [ 'users', 'owner' ],
      where: {
        owner: {
          id: uid
        }
      }
    });
  }

  /**
   * Create a new invite group, given a list of unique user identifiers.
   * 
   * @param loggedUserId the id of the user that is creating a new invite group. This id should not be present in `uids`.
   * In case it is, a ServiceException is thrown.
   *
   * @param uids an array of user identifiers. Every identifier must refer to a valid `UserEntity`.
   *
   * @return - the newly created invite group.
   */

  async create(
    ownerId: number,
    label: string,
    nametags: string[]
  ): Promise<InviteGroupEntity>
  {
    const owner = await this.usersService.findById(ownerId);

    if (!owner) {
      throw new ServiceException(`Could not find owner with id ${ownerId}`, HttpStatus.NOT_FOUND);
    }

    /**
     * TBD: revise this condition to allow special users to bypass the limit or have a different limit.
     */
    if (!owner.invitegroups || owner.invitegroups.length === this.MAX_GROUP_COUNT) {
      throw new ServiceException(`Invite group user limit reached (${this.MAX_GROUP_COUNT}/${this.MAX_GROUP_COUNT})`, HttpStatus.UNAUTHORIZED);
    }

    const nametagSet = new Set(nametags);

    // TODO: implement that check when request is validated instead, by creating a custom decorator.
    if (nametagSet.size < 2) {
      throw new ServiceException('Less than 2 dinstinct ids provided.', HttpStatus.BAD_REQUEST);
    }

    if (nametagSet.has(`${owner.name}#${owner.tag}`)) {
        throw new ServiceException(`Can't add user to its own invite group.`, HttpStatus.CONFLICT);
    }

    // resolves the nametag array to an array of UserEntity
    const users = await Promise.all(Array.from(nametagSet).map(async nametag => {
      const user = await this.usersService.findByNametag(nametag);
      // This check may already have been handled by the validation pipe.
      if (!user) {
        throw new ServiceException(`User ${nametag} could not be found`, HttpStatus.NOT_FOUND);
      }
      return user;
    }));


    let igrp = this.inviteGroupRepo.create({
      label: label,
      owner: {
        id: ownerId
      },
      users
    });

    try {
      igrp = await this.inviteGroupRepo.save(igrp);
    } catch(error) {
      if (error.code === '23505') {
        throw new ServiceException(`Invite group named '${label}' already exists for that user.`);
      } else
        console.error(error);
    }
  
    owner.invitegroups.push(igrp);
    await this.usersRepository.save(owner);

    return igrp;
  }

  async updateOne(
    gid: number,
    ownerId: number,
    label?: string, 
    nametags?: string[]
  ): Promise<InviteGroupEntity>
  {
    const owner = await this.usersService.findById(ownerId);

    if (!owner) {
      throw new ServiceException(`Could not find owner of the invite group, identified by id(${ownerId})`, HttpStatus.NOT_FOUND);
    }

    const igrp = await this.findById(ownerId, gid);

    if (!igrp) {
      throw new ServiceException('Could not found an invite group with that id for that user', HttpStatus.NOT_FOUND);
    }

    if (label) {
      igrp.label = label;
    }

    if (nametags) {
      const nametagSet = new Set(nametags); 

      // TODO: implement that check when request is validated instead, by creating a custom decorator.
      if (nametagSet.size < 2) {
        throw new ServiceException('Less than 2 dinstinct ids provided.', HttpStatus.BAD_REQUEST);
      }

      if (nametagSet.has(`${owner.name}#${owner.tag}`)) {
          throw new ServiceException(`Can't add user to its own invite group.`, HttpStatus.CONFLICT);
      }

      igrp.users = await Promise.all(Array.from(nametagSet).map( async uid => {
        const user = await this.usersService.findByNametag(uid);
        if (!user) {
          throw new ServiceException(`User with id ${uid} could not be found`, HttpStatus.NOT_FOUND);
        }
        return user;
      }));
    }

    return this.inviteGroupRepo.save(igrp);
  }
  
  async removeOne(ownerId: number, gid: number): Promise<InviteGroupEntity>
  {
    const igrp = await this.findById(ownerId, gid);

    if (!igrp) {
      throw new ServiceException(`Could not found an invite group identified by id(${gid}) for that user`,
       HttpStatus.NOT_FOUND);
    }

    return this.inviteGroupRepo.remove(igrp);
  }
}
