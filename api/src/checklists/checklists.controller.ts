import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { AREAS } from '../common/areas.js';
import type { AuthUser } from '../common/auth-user.js';
import { CurrentUser, Roles } from '../common/decorators.js';
import { parse } from '../common/zod.js';
import { ChecklistsService } from './checklists.service.js';

const submitSchema = z.object({
  tasks: z
    .array(
      z.object({
        area: z.enum(AREAS),
        description: z.string().trim().min(3, 'Describe the task').max(120),
        dueTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM, like 14:30'),
      }),
    )
    .min(1, 'Add at least one task')
    .max(60),
});

const decideSchema = z.object({
  approve: z.boolean(),
  note: z.string().trim().max(300).optional(),
});

@Controller('checklists')
export class ChecklistsController {
  constructor(private readonly checklists: ChecklistsService) {}

  @Roles('STORE_MANAGER')
  @Get('mine')
  mine(@CurrentUser() user: AuthUser) {
    return this.checklists.mine(user);
  }

  @Roles('STORE_MANAGER')
  @Post()
  @HttpCode(201)
  submit(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.checklists.submit(user, parse(submitSchema, body).tasks);
  }

  @Roles('GENERAL_MANAGER')
  @Get('pending')
  pending() {
    return this.checklists.pending();
  }

  @Roles('GENERAL_MANAGER')
  @Post(':id/decide')
  @HttpCode(200)
  decide(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    const { approve, note } = parse(decideSchema, body);
    return this.checklists.decide(user, id, approve, note);
  }
}
