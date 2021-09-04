import {NotFoundException, Post} from '@nestjs/common';
import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import {ApiConflictResponse, ApiTags} from '@nestjs/swagger';
import { ServiceException } from '../../misc/serviceexception';
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
    const user = await this.usersService.findByNametag(name + tag);

    if (!user) {
      throw new NotFoundException(`${name}#${tag} does not refer to a valid user`);
    }

    return user;
  }

  @Post('/')
  async createUser(
    @Body() userData: CreateUserDto
  )
  {
    try {
      return await this.usersService.create(userData);
    } catch(error) {
      if (error instanceof ServiceException) {
        error.throwAsHttpException();
      }
      console.error(error);
    }
  }

  @UseGuards(UserExistsGuard)
  @Get('/:userId')
  getUser() {
    return 'exists';
  }
}
