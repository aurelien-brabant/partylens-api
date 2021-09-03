import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PartiesModule } from './parties/parties.module';
import { AuthModule } from './auth/auth.module';
import { SeedersModule } from './seeders/seeders.module';
import { ValidatorsModule } from './validators/validations.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      host: process.env.POSTGRES_HOST,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development' /* synchronization must be always disabled in production! */
    }),
    UsersModule,
    PartiesModule,
    AuthModule,
    SeedersModule,
    ValidatorsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
