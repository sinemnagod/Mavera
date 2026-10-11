import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from '../common/decorators.js';
import { GmService } from './gm.service.js';

@Roles('GENERAL_MANAGER')
@Controller('gm')
export class GmController {
  constructor(private readonly gm: GmService) {}

  @Get('overview')
  overview() {
    return this.gm.overview();
  }

  @Get('locations/:id')
  location(@Param('id') id: string) {
    return this.gm.location(id);
  }
}
