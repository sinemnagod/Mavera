import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { verifyPassword } from './password.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { location: true },
    });
    const passwordMatches = user
      ? await verifyPassword(password, user.passwordHash)
      : false;
    // The same message for "no such email" and "wrong password", so the
    // response never reveals which emails have accounts.
    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.jwt.signAsync({
      sub: user.id,
      name: user.name,
      role: user.role,
      locationId: user.locationId,
    });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        locationId: user.locationId,
        locationName: user.location?.name ?? null,
      },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { location: true },
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      locationId: user.locationId,
      locationName: user.location?.name ?? null,
    };
  }
}
