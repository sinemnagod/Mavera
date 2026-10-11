import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Role } from '../generated/prisma/enums.js';
import type { AuthUser } from './auth-user.js';

export const IS_PUBLIC = 'isPublic';
export const ROLES = 'roles';

// Every route needs a valid JWT unless it is marked @Public().
export const Public = () => SetMetadata(IS_PUBLIC, true);

// Only these roles may call the route.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);

// Gives a route handler the signed-in user.
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: AuthUser }>();
    return request.user;
  },
);
