import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import type { AuthUser } from '../common/auth-user.js';
import { CurrentUser, Roles } from '../common/decorators.js';
import { CleaningService } from './cleaning.service.js';

@Roles('CLEANER')
@Controller('cleaning')
export class CleaningController {
  constructor(private readonly cleaning: CleaningService) {}

  @Get('today')
  today(@CurrentUser() user: AuthUser) {
    return this.cleaning.today(user);
  }

  @Post('tasks/:id/complete')
  @HttpCode(201)
  complete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cleaning.complete(user, id);
  }
}
