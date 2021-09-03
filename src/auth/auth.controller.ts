import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {AuthService} from './auth.service';
import {JwtAuthGuard} from './guard/jwt-auth.guard';
import {LocalAuthGuard} from './guard/local-hauth.guard';

@ApiTags('User authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {};

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(
    @Request() req: any,
  )
  {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  authenticate(
    @Request() req: any
  )
  {
    return req.user;
  }
}
