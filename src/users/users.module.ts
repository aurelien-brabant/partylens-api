import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UserExistsGuard} from './user-exists.guard';
import {UserEntity} from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ 
    TypeOrmModule.forFeature([ UserEntity ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserExistsGuard],
  exports: [UsersService, UserExistsGuard]
})
export class UsersModule {}
