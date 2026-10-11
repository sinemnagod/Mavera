import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type AuthUser, requireLocation } from '../common/auth-user.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SpillsService {
  constructor(private readonly prisma: PrismaService) {}

  create(user: AuthUser, input: { area: string; description: string }) {
    return this.prisma.spillReport.create({
      data: {
        locationId: requireLocation(user),
        area: input.area,
        description: input.description,
        reportedById: user.id,
      },
    });
  }

  // Open spills, newest first. This is the urgent list at the top of the cleaner's screen.
  async listOpen(user: AuthUser) {
    const spills = await this.prisma.spillReport.findMany({
      where: { locationId: requireLocation(user), resolved: false },
      orderBy: { reportedAt: 'desc' },
      include: { reportedBy: { select: { name: true, role: true } } },
    });
    return spills.map((spill) => ({
      id: spill.id,
      area: spill.area,
      description: spill.description,
      reportedAt: spill.reportedAt,
      reportedBy: spill.reportedBy.name,
      reportedByRole: spill.reportedBy.role,
    }));
  }

  async resolve(user: AuthUser, spillId: string) {
    const spill = await this.prisma.spillReport.findFirst({
      where: { id: spillId, locationId: requireLocation(user) },
    });
    if (!spill) throw new NotFoundException('Spill report not found');
    if (spill.resolved) throw new ConflictException('This spill is already cleaned up');
    return this.prisma.spillReport.update({
      where: { id: spill.id },
      data: { resolved: true, resolvedById: user.id, resolvedAt: new Date() },
    });
  }
}
