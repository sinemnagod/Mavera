import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { AREAS } from '../common/areas.js';
import type { AuthUser } from '../common/auth-user.js';
import { CurrentUser, Roles } from '../common/decorators.js';
import { parse } from '../common/zod.js';
import { SpillsService } from './spills.service.js';

const spillSchema = z.object({
  area: z.enum(AREAS),
  description: z.string().trim().min(3, 'Say what happened').max(200),
});

@Controller('spills')
export class SpillsController {
  constructor(private readonly spills: SpillsService) {}

  // Flow 3: waiter, kitchen or store manager reports, and it lands at the top of the cleaner's queue.
  @Roles('WAITER', 'KITCHEN', 'STORE_MANAGER')
  @Post()
  @HttpCode(201)
  create(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.spills.create(user, parse(spillSchema, body));
  }

  @Roles('CLEANER')
  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.spills.listOpen(user);
  }

  @Roles('CLEANER')
  @Post(':id/resolve')
  @HttpCode(200)
  resolve(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.spills.resolve(user, id);
  }
}
