import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthUser } from '../common/auth-user.js';
import { IS_PUBLIC } from '../common/decorators.js';
import type { Role } from '../generated/prisma/enums.js';

interface JwtPayload {
  sub: string;
  name: string;
  role: Role;
  locationId: string | null;
}

// Runs before every route: no valid token, no entry (except @Public routes).
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    const header = request.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) throw new UnauthorizedException('Sign in required');

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      request.user = {
        id: payload.sub,
        name: payload.name,
        role: payload.role,
        locationId: payload.locationId,
      };
    } catch {
      throw new UnauthorizedException('Your session has expired. Sign in again.');
    }
    return true;
  }
}
