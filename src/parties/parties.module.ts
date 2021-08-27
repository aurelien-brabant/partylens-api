import { Module } from '@nestjs/common';
import { PartiesService } from './parties.service';
import { PartiesController } from './parties.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PartyEntity} from './party.entity';
import {PartymembersModule} from 'src/partymembers/partymembers.module';
import {UsersModule} from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ PartyEntity ]),
    PartymembersModule,
    UsersModule,
  ],
  providers: [PartiesService],
  controllers: [PartiesController],
  exports: [PartiesService],
})
export class PartiesModule {}
