import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UsersModule} from 'src/users/users.module';

import {PartyEntity} from './entity/party.entity';
import {PartymemberEntity} from './entity/partymember.entity';

import { PartiesService } from './service/parties.service';
import {PartymembersService} from './service/partymembers.service';

import { PartiesController } from './controller/parties.controller';
import {PartymembersController} from './controller/partymembers.controller';
import {PartyItemEntity} from './entity/partyitem.entity';
import {PartyItemParticipationEntity} from './entity/partyitemparticipation.entity';
import {PartyitemsController} from './controller/partyitems.controller';
import { PartyitemsService } from './service/partyitems.service';
import {PartyitemparticipationsController} from './controller/partyitemparticipations.controller';
import {PartyitemparticipationsService} from './service/partyitemparticipations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PartyEntity,
      PartymemberEntity,
      PartyItemEntity,
      PartyItemParticipationEntity,
    ]),
    UsersModule,
  ],
  controllers: [ PartiesController, PartymembersController, PartyitemsController, PartyitemparticipationsController ],
  providers: [ PartiesService, PartymembersService, PartyitemsService, PartyitemparticipationsService ],
  exports: [ PartiesService ],
})
export class PartiesModule {}
