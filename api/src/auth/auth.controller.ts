import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { z } from 'zod';
import type { AuthUser } from '../common/auth-user.js';
import { CurrentUser, Public } from '../common/decorators.js';
import { parse } from '../common/zod.js';
import { AuthService } from './auth.service.js';

const loginSchema = z.object({
  email: z.string().min(1, 'Enter your email'),
  password: z.string().min(1, 'Enter your password'),
});

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() body: unknown) {
    const { email, password } = parse(loginSchema, body);
    return this.auth.login(email, password);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }
}
