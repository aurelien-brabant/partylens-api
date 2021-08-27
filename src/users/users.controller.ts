import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UserExistsGuard} from './user-exists.guard';
import {UsersService} from './users.service';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) {
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  
  @Post()
  create(@Body() userData: CreateUserDto) {
    return this.usersService.create(userData);
  }

  @UseGuards(UserExistsGuard)
  @Get(':userId')
  getUser() {
    return 'exists';
  }
}
