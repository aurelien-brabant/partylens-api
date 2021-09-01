import {HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {ServiceException} from "src/misc/serviceexception";
import {Repository} from "typeorm";
import {UpdateInviteGroupDto} from "../dto/update-invitegroup.dto";
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

  findAll(): Promise<InviteGroupEntity[]>
  {
    return this.inviteGroupRepo.find({
      relations: [ 'users' ]
    });
  }

  findById(gid: number): Promise<InviteGroupEntity>
  {
    return this.inviteGroupRepo.findOne(gid, {
      relations: [ 'users' ]
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
    uids: number[]
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

    const uidSet = new Set(uids);

    // TODO: implement that check when request is validated instead, by creating a custom decorator.
    if (uidSet.size < 2) {
      throw new ServiceException('Less than 2 dinstinct ids provided.', HttpStatus.BAD_REQUEST);
    }

    if (uidSet.has(ownerId)) {
        throw new ServiceException(`Can't add user to its own invite group.`, HttpStatus.CONFLICT);
    }

    for (const uid of uidSet) {
      if (!await this.usersService.findById(uid)) {
        throw new ServiceException(`User with id ${uid} could not be found`, HttpStatus.NOT_FOUND);
      }
    }

    let igrp = this.inviteGroupRepo.create({
      label: label,
      owner: {
        id: ownerId
      },
    });

    /**
     * Only way I found to intialize the array from identifiers only.
     * See: https://github.com/typeorm/typeorm/issues/447
     */
    igrp.users = Array.from(uidSet).map(uid => ({ id: uid })) as any;

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
    uids?: number[]
  ): Promise<InviteGroupEntity>
  {
    const igrp = await this.findById(gid);

    if (!igrp) {
      throw new ServiceException('Could not found an invite group with that id for that user', HttpStatus.NOT_FOUND);
    }

    if (label) {
      igrp.label = label;
    }

    if (uids) {
      const uidSet = new Set(uids); 

      // TODO: implement that check when request is validated instead, by creating a custom decorator.
      if (uidSet.size < 2) {
        throw new ServiceException('Less than 2 dinstinct ids provided.', HttpStatus.BAD_REQUEST);
      }

      if (uidSet.has(ownerId)) {
          throw new ServiceException(`Can't add user to its own invite group.`, HttpStatus.CONFLICT);
      }
      /* retrieve each user, checking for possiblity that the user does not exist, the awaits the promise array. */
      igrp.users = await Promise.all(Array.from(uidSet).map( async uid => {
        const user = await this.usersService.findById(uid)
        if (!user) {
          throw new ServiceException(`User with id ${uid} could not be found`, HttpStatus.NOT_FOUND);
        }
        return user;
      }));
    }

    return this.inviteGroupRepo.save(igrp);
  }
  
  async removeOne(gid: number): Promise<InviteGroupEntity>
  {
    const igrp = await this.findById(gid);

    if (!igrp) {
      throw new ServiceException('Could not found an invite group with that id for that user', HttpStatus.NOT_FOUND);
    }

    return this.inviteGroupRepo.remove(igrp);
  }
}
