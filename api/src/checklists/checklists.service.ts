import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type AuthUser, requireLocation } from '../common/auth-user.js';
import { PrismaService } from '../prisma/prisma.service.js';

interface TaskInput {
  area: string;
  description: string;
  dueTime: string;
}

@Injectable()
export class ChecklistsService {
  constructor(private readonly prisma: PrismaService) {}

  // The store manager's versions for their own location, newest first.
  async mine(user: AuthUser) {
    const versions = await this.prisma.checklistVersion.findMany({
      where: { locationId: requireLocation(user) },
      orderBy: { version: 'desc' },
      include: { tasks: { orderBy: [{ area: 'asc' }, { dueTime: 'asc' }] } },
    });
    return versions.map((version) => this.shape(version));
  }

  // Flow 4: a new version always starts as PENDING until the GM decides.
  async submit(user: AuthUser, tasks: TaskInput[]) {
    const locationId = requireLocation(user);
    const waiting = await this.prisma.checklistVersion.findFirst({
      where: { locationId, status: 'PENDING' },
    });
    if (waiting) {
      throw new ConflictException('A version is already waiting for approval');
    }
    const latest = await this.prisma.checklistVersion.findFirst({
      where: { locationId },
      orderBy: { version: 'desc' },
    });
    const version = await this.prisma.checklistVersion.create({
      data: {
        locationId,
        version: (latest?.version ?? 0) + 1,
        submittedById: user.id,
        tasks: { create: tasks },
      },
      include: { tasks: true },
    });
    return this.shape(version);
  }

  async pending() {
    const versions = await this.prisma.checklistVersion.findMany({
      where: { status: 'PENDING' },
      orderBy: { submittedAt: 'asc' },
      include: {
        location: true,
        submittedBy: { select: { name: true } },
        tasks: { orderBy: [{ area: 'asc' }, { dueTime: 'asc' }] },
      },
    });
    return versions.map((version) => ({
      ...this.shape(version),
      locationName: version.location.name,
      submittedBy: version.submittedBy.name,
    }));
  }

  async decide(user: AuthUser, versionId: string, approve: boolean, note?: string) {
    if (!approve && !note) throw new BadRequestException('Say why you are rejecting it');
    const version = await this.prisma.checklistVersion.findUnique({ where: { id: versionId } });
    if (!version) throw new NotFoundException('Checklist version not found');
    if (version.status !== 'PENDING') throw new ConflictException('This version was already decided');

    const updated = await this.prisma.checklistVersion.update({
      where: { id: versionId },
      data: {
        status: approve ? 'APPROVED' : 'REJECTED',
        decidedById: user.id,
        decidedAt: new Date(),
        note: note ?? null,
      },
      include: { tasks: true },
    });
    return this.shape(updated);
  }

  private shape(version: {
    id: string;
    locationId: string;
    version: number;
    status: string;
    submittedAt: Date;
    decidedAt: Date | null;
    note: string | null;
    tasks: { id: string; area: string; description: string; dueTime: string }[];
  }) {
    return {
      id: version.id,
      locationId: version.locationId,
      version: version.version,
      status: version.status,
      submittedAt: version.submittedAt,
      decidedAt: version.decidedAt,
      note: version.note,
      tasks: version.tasks.map((t) => ({
        id: t.id,
        area: t.area,
        description: t.description,
        dueTime: t.dueTime,
      })),
    };
  }
}
