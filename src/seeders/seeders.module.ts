import { Module } from '@nestjs/common';
import { SeedersService } from './seeders.service';

@Module({
  providers: [SeedersService]
})
export class SeedersModule {}
