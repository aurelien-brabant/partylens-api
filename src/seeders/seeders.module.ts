import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyEntity } from '../parties/entity/party.entity';
import { PartiesModule } from '../parties/parties.module';
import { UserEntity } from '../users/entity/user.entity';
import { UsersModule } from '../users/users.module';
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
