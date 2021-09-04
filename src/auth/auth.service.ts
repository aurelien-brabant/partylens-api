import { Injectable } from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import { UserEntity } from '../users/entity/user.entity';
import { UsersService } from '../users/service/users.service';

const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<UserEntity>
  {
    const user = await this.usersService.findByEmail(email);

    if (user && await bcrypt.compare(password, user.password)) {
      delete user.password;
      return user;
    }

    return null;
  }

  async login(user: UserEntity) {
    return {
      access_token: this.jwtService.sign({ ... user }),
    };
  }
}
