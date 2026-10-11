import { ForbiddenException } from '@nestjs/common';
import type { Role } from '../generated/prisma/enums.js';

// Who is making the request. The sign-in guard fills this in from the JWT.
export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  locationId: string | null;
}


// Staff accounts belong to one location. Everything they read or change is limited to it.
export function requireLocation(user: AuthUser): string {
  if (!user.locationId) {
    throw new ForbiddenException('This account is not tied to a location');
  }
  return user.locationId;
}
