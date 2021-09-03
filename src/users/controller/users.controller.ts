import {BadRequestException, NotFoundException} from '@nestjs/common';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {ApiConflictResponse, ApiCreatedResponse, ApiTags} from '@nestjs/swagger';
import {QueryFilterManager} from 'src/misc/filter';
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

  /**
    Find all users.
   */

  @Get()
  findAll(
  ) {
    return this.usersService.findAll();
  }
  
  @ApiConflictResponse({
    description: 'User with the same email address already exists.'
  })
  create(@Body() userData: CreateUserDto) {
    return this.usersService.create(userData);
  }

  @Get('/bytag')
  async getByNameAndTag(
    @Query('name') name: string,
    @Query('tag') tag: string,
  ) {
    const user = await this.usersService.findByNameAndTag(name, tag);

    if (!user) {
      throw new NotFoundException(`${name}#${tag} does not refer to a valid user`);
    }

    return user;
  }

  @UseGuards(UserExistsGuard)
  @Get('/:userId')
  getUser() {
    return 'exists';
  }
}
