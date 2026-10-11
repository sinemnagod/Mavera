import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import type { AuthUser } from '../common/auth-user.js';
import { CurrentUser, Roles } from '../common/decorators.js';
import { parse } from '../common/zod.js';
import { FloorService } from './floor.service.js';

const seatSchema = z.object({ covers: z.number().int().min(1).max(20) });

@Controller('tables')
export class FloorController {
  constructor(private readonly floor: FloorService) {}

  @Roles('WAITER')
  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.floor.list(user);
  }

  @Roles('WAITER')
  @Post(':id/seat')
  @HttpCode(200)
  seat(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    const { covers } = parse(seatSchema, body);
    return this.floor.seat(user, id, covers);
  }

  @Roles('WAITER')
  @Post(':id/check')
  @HttpCode(200)
  requestCheck(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.floor.requestCheck(user, id);
  }

  @Roles('WAITER')
  @Post(':id/close')
  @HttpCode(200)
  close(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.floor.close(user, id);
  }
}
