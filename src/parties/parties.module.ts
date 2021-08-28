import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UsersModule} from 'src/users/users.module';

import {PartyEntity} from './entity/party.entity';
import {PartymemberEntity} from './entity/partymember.entity';

import { PartiesService } from './service/parties.service';
import {PartymembersService} from './service/partymembers.service';

import { PartiesController } from './controller/parties.controller';
import {PartymembersController} from './controller/partymembers.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ PartyEntity, PartymemberEntity ]),
    UsersModule,
  ],
  controllers: [ PartiesController, PartymembersController ],
  providers: [ PartiesService, PartymembersService ],
  exports: [ PartiesService ],
})
export class PartiesModule {}
