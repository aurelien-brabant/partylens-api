import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {AuthService} from './auth.service';
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
}
