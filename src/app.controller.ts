import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {API_VERSION} from './constants';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getApiInfo(): any {
    return {
      apiVersion: API_VERSION,
    }
  }
}
