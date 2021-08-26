import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreateUserDto} from './dto/create-user.dto';
import {UserEntity, UserState} from './user.entity';

const bcrypt = require('bcrypt');

@Injectable()
export class UsersService {
  saltRounds = 10;

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>
  ) {}

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ email });

    if (!user) {
      throw new NotFoundException('No user with this email address');
    }

    return user;
  }
      
  async findById(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException('No user with such id');
    }

    return user;
  }

  findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  async create(userData: CreateUserDto): Promise<UserEntity> {
    userData.password = await bcrypt.hash(userData.password, this.saltRounds);

    let newUser = this.usersRepository.create({
      ... userData,
      state: UserState.PENDING_CONFIRMATION,
    });

    try {
      newUser = await this.usersRepository.save(userData);
    } catch(error) {
      if (error?.code === '23505') {
        throw new ConflictException('A user with the same address email already exists');
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
