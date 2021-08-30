import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {PartyEntity} from 'src/parties/entity/party.entity';
import { PartiesModule } from 'src/parties/parties.module';
import { UserEntity } from 'src/users/entity/user.entity';
import { UsersModule } from 'src/users/users.module';
import { SeedersService } from './seeders.service';

@Module({
  imports: [
    UsersModule,
    PartiesModule,
    TypeOrmModule.forFeature([UserEntity, PartyEntity])],
  providers: [SeedersService],
  exports: [SeedersModule]
})
export class SeedersModule {}
