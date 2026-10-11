import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AuthUser } from '../common/auth-user.js';
import { ROLES } from '../common/decorators.js';
import type { Role } from '../generated/prisma/enums.js';

// Runs after the JWT guard: checks the user's role against @Roles(...) on the route.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowed = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!allowed) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    if (!request.user || !allowed.includes(request.user.role)) {
      throw new ForbiddenException('Your role cannot do this');
    }
    return true;
  }
}
