import { Module } from '@nestjs/common';
import { PartymembersService } from './partymembers.service';
import { PartymembersController } from './partymembers.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PartymemberEntity} from './partymember.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ PartymemberEntity ]),
  ],
  providers: [PartymembersService],
  controllers: [PartymembersController],
  exports: [PartymembersService]
})
export class PartymembersModule {}
