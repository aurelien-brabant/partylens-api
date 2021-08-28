import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiTags} from '@nestjs/swagger';
import {CreateUserDto} from '../dto/create-user.dto';
import {UserExistsGuard} from '../guard/user-exists.guard';
import {UsersService} from '../service/users.service';

@ApiTags('User management')
@Controller('/users/')
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
  @ApiCreatedResponse({
    description: 'Record successfuly created.',
    type: CreateUserDto
  })
  @ApiConflictResponse({
    description: 'User with the same email address already exists.'
  })
  create(@Body() userData: CreateUserDto) {
    return this.usersService.create(userData);
  }

  @UseGuards(UserExistsGuard)
  @Get(':userId')
  getUser() {
    return 'exists';
  }
}
