import { Module } from '@nestjs/common';
import { PartiesService } from './parties.service';
import { PartiesController } from './parties.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PartyEntity} from './party.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ PartyEntity ])],
  providers: [PartiesService],
  controllers: [PartiesController]
})
export class PartiesModule {}
