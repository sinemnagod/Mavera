import { Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { AuthUser } from '../common/auth-user.js';
import { CurrentUser, Roles } from '../common/decorators.js';
import { AiService } from './ai.service.js';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  // Streams the briefing to the browser as it is written. Only the general manager may ask.
  @Roles('GENERAL_MANAGER')
  @Post('briefing')
  async briefing(@CurrentUser() user: AuthUser, @Res() response: Response) {
    // If the browser closes the connection (the user pressed Stop), stop the model too.
    const controller = new AbortController();
    response.on('close', () => controller.abort());
    await this.ai.briefing(user, response, controller.signal);
  }
}
