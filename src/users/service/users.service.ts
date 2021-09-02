import { ConflictException, Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreateUserDto} from '../dto/create-user.dto';
import {UserEntity, UserState} from '../entity/user.entity';

const bcrypt = require('bcrypt');

@Injectable()
export class UsersService {
  saltRounds = 10;

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>
  ) {}

  /**
   * XXX - Find by email has the particularity that it explicitly selects the password property,
   * which is never selected by default. This is why findByEmail should be user for authentication
   * purposes.
   */
  findByEmail(email: string): Promise<UserEntity> {
    return this.usersRepository.createQueryBuilder('user')
      .where("user.email = :email", { email })
      .addSelect('user.password')
      .getOne();
  }
      
  findById(id: number): Promise<UserEntity> {
    return this.usersRepository.findOne(id, {
      relations: ['invitegroups']
    });
  }

  findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find({
      relations: ['invitegroups']
    });
  }

  async create(userData: CreateUserDto): Promise<UserEntity> {
    userData.password = await bcrypt.hash(userData.password, this.saltRounds);

    let newUser = this.usersRepository.create({
      ... userData,
      state: UserState.PENDING_CONFIRMATION,
      invitegroups: []
    });

    try {
      newUser = await this.usersRepository.save(userData);
    } catch(error) {
      if (error?.code === '23505') {
        throw new ConflictException('A user with the same address email already exists');
      }
    }

    delete newUser.password;
    delete newUser.state;

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
