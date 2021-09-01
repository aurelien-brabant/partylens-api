import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {InviteGroupsController} from './controller/invitegroups.controller';
import {UsersController} from './controller/users.controller';
import {InviteGroupEntity} from './entity/invitegroup.entity';
import {UserEntity} from './entity/user.entity';
import {InviteGroupsService} from './service/invitegroups.service';
import {UsersService} from './service/users.service';

@Module({
  imports: [  
    TypeOrmModule.forFeature([
      UserEntity,
      InviteGroupEntity
    ]),
  ],
  controllers: [UsersController, InviteGroupsController],
  providers: [UsersService, InviteGroupsService],
  exports: [UsersService]
})
export class UsersModule {}
