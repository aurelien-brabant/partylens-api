import { Controller, Get, Param } from '@nestjs/common';
import {PartiesService} from './parties.service';

@Controller()
export class PartiesController {
  constructor(
    private readonly partiesService: PartiesService
  ) { }

  @Get('/')
  findUserParties(@Param('userId') userId: number)
  {
    console.log(userId);
    return this.partiesService.findPartiesForUser(userId);
  }
}
