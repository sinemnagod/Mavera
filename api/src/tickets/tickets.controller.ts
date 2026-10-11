import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import type { AuthUser } from '../common/auth-user.js';
import { CurrentUser, Roles } from '../common/decorators.js';
import { TicketsService } from './tickets.service.js';

@Roles('KITCHEN')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.tickets.list(user);
  }

  @Post(':id/start')
  @HttpCode(200)
  start(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.tickets.start(user, id);
  }

  @Post(':id/ready')
  @HttpCode(200)
  ready(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.tickets.ready(user, id);
  }

  @Post(':id/bump')
  @HttpCode(200)
  bump(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.tickets.bump(user, id);
  }
}
