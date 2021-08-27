import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PartiesModule } from './parties/parties.module';
import {RouterModule} from '@nestjs/core';
import {routes} from './routes';
import { PartymembersModule } from './partymembers/partymembers.module';

@Module({
  imports: [
    UsersModule,
    PartiesModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      host: process.env.POSTGRES_HOST,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development' /* synchronization must be always disabled in production! */
    }),
    RouterModule.register(routes),
    PartymembersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
