import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UsersController} from './controller/users.controller';
import {UserEntity} from './entity/user.entity';
import {UsersService} from './service/users.service';

@Module({
  imports: [  
    TypeOrmModule.forFeature([ UserEntity ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
