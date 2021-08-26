import { Injectable, NotFoundException } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {UserEntity} from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new NotFoundException('No user with this email address');
    }

    delete user.password;
    return user;
  }
}
