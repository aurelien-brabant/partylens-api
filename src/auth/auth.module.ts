import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {PassportModule} from '@nestjs/passport';
import {LocalStrategy} from './strategy/strategy.local.strategy';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from './strategy/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, PassportModule, 
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' }
    })
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
