import { Injectable, NotFoundException } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreateUserDto} from './dto/create-user.dto';
import {UserEntity} from './user.entity';

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

    delete user.password;
    return user;
  }

  findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  async create(userData: CreateUserDto): Promise<UserEntity> {
    userData.password = await bcrypt.hash(userData.password, this.saltRounds);

    let newUser = this.usersRepository.create(userData);
    newUser = await this.usersRepository.save(userData);

    delete newUser.password;
    return newUser; 
  }
}
