import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceException } from '../../misc/serviceexception';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserEntity, UserState } from '../entity/user.entity';

const bcrypt = require('bcrypt');

@Injectable()
export class UsersService {
  saltRounds = 10;

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>
  ) {}

  /**
   * @description Randomly generates a single tag.
   */

  genTag(): string
  {
    let tag = '';

    for (let i = 0; i != 4; ++i) {
      tag += Math.round(Math.random() * 9);
    }

    return tag;
  }

  /**
   * @description generate a UNIQUE user tag based on its username.
   * 
   * @param {string} the user's name field, which is used to decide uniqueness of the tag.
   *
   * @return {string} a promise that resolves to the tag, encoded in a string in the following format:
   * "XXXX" where each 'X' is a digit between 0 and 9.
   */

  async genUniqueUserTag(username: string): Promise<string>
  {
    /* Get all tags from user that have the same name than the one passed as an argument. */

    const existingTags = (await this.usersRepository.createQueryBuilder('user')
    .select([ 'user.tag' ])
    .where('user.name = :name', { name: username })
    .getMany())
    .map(({ tag }) => tag);

    /* There are too many users that are named the same, tag generation is thus impossible */
    if (existingTags.length === 9999) {
      throw new ServiceException(`Name ${username} is unavailable.`, HttpStatus.CONFLICT);
    }

    let tag: string;

    /* Generate a new random tag using this.genTag until the tag is unique */

    do {
      tag = this.genTag();
    } while (existingTags.includes(tag));

    return tag;
  }

  /**
   * XXX - Find by email has the particularity that it explicitly selects the password and email properties,
   * which are never selected by default.
   * This is why findByEmail should be user for authentication purposes.
   */
  findByEmail(email: string): Promise<UserEntity> {
    return this.usersRepository.createQueryBuilder('user')
      .where("user.email = :email", { email })
      .addSelect('user.password')
      .addSelect('user.email')
      .getOne();
  }

  /**
   * @description Find a specific user given its name and tag, forming a unique identifier.
   * User must be activated.
   *
   * @param {string} the nametag. @see isNametag.
   *
   * NOTE: no validation is done for `name` and `tag`. The caller of this function must implement it
   * by himself if he wants some. Anyway, a malformed name or tag, as they are strings, will only result
   * in a Not Found error. There's no security risk associated with that.
   */

  findByNametag(nametag: string): Promise<UserEntity>
  {
    const [name, tag] = nametag.split('#');

    return this.usersRepository.createQueryBuilder('user')
    .select([ 'user.name', 'user.tag', 'user.id' ])
    //.where('user.state = :userState', { userState: UserState.ACTIVATED })
    .where('user.name = :name', { name })
    .andWhere('user.tag = :tag', { tag })
    .getOne();
  }

  findById(id: number): Promise<UserEntity> {
    return this.usersRepository.findOne(id, {
      relations: ['invitegroups']
    });
  }

  findAll(): Promise<UserEntity[]>
  {
    return this.usersRepository.find({
      relations: ['invitegroups']
    });
  }

  async create(userData: CreateUserDto): Promise<UserEntity> {
    const hashedPwd = await bcrypt.hash(userData.password, this.saltRounds)
    const tag = await this.genUniqueUserTag(userData.name);

    let newUser = this.usersRepository.create({
      ... userData,
      state: UserState.PENDING_CONFIRMATION,
      invitegroups: [],
      password: hashedPwd,
      tag
    });

    try {
      newUser = await this.usersRepository.save(newUser);
    } catch(error) {
      if (error?.code === '23505') {
        throw new ServiceException('A user with the same address email already exists');
      }
    }

    return newUser; 
  }

  async update(id: number, attrs: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.findById(id);

    Object.assign(user, attrs);
    
    return this.usersRepository.save(user);
  }

  async delete(id: number): Promise<UserEntity> {
    const user = await this.findById(id);

    return this.usersRepository.remove(user); 
  }
}
