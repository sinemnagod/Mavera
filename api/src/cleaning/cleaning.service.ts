import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AREAS } from '../common/areas.js';
import { type AuthUser, requireLocation } from '../common/auth-user.js';
import { istanbulNow, minutesFromClock, startOfIstanbulDay } from '../common/time.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CleaningService {
  constructor(private readonly prisma: PrismaService) {}

  // The newest APPROVED checklist is the cleaner's list for today (flow 4).
  async today(user: AuthUser) {
    const locationId = requireLocation(user);
    const version = await this.prisma.checklistVersion.findFirst({
      where: { locationId, status: 'APPROVED' },
      orderBy: { version: 'desc' },
      include: { tasks: true },
    });
    if (!version) return { version: null, tasks: [], summary: { total: 0, done: 0, overdue: 0 } };

    const completions = await this.prisma.taskCompletion.findMany({
      where: { locationId, completedAt: { gte: startOfIstanbulDay() } },
      include: { completedBy: { select: { name: true } } },
    });
    const completionByTask = new Map(completions.map((c) => [c.taskId, c]));
    const nowMinutes = istanbulNow().minutes;

    const tasks = version.tasks
      .map((task) => {
        const completion = completionByTask.get(task.id);
        return {
          id: task.id,
          area: task.area,
          description: task.description,
          dueTime: task.dueTime,
          completed: completion
            ? { by: completion.completedBy.name, at: completion.completedAt }
            : null,
          overdue: !completion && minutesFromClock(task.dueTime) < nowMinutes,
        };
      })
      .sort(
        (a, b) =>
          (AREAS as readonly string[]).indexOf(a.area) - (AREAS as readonly string[]).indexOf(b.area) ||
          a.dueTime.localeCompare(b.dueTime),
      );

    return {
      version: version.version,
      tasks,
      summary: {
        total: tasks.length,
        done: tasks.filter((t) => t.completed).length,
        overdue: tasks.filter((t) => t.overdue).length,
      },
    };
  }

  // Flow 6: each completion is a timestamped row the GM's compliance number can use.
  async complete(user: AuthUser, taskId: string) {
    const locationId = requireLocation(user);
    const task = await this.prisma.checklistTask.findFirst({
      where: { id: taskId, version: { locationId, status: 'APPROVED' } },
    });
    if (!task) throw new NotFoundException('Task not found');

    const already = await this.prisma.taskCompletion.findFirst({
      where: { taskId, completedAt: { gte: startOfIstanbulDay() } },
    });
    if (already) throw new ConflictException('This task is already done today');

    return this.prisma.taskCompletion.create({
      data: { locationId, taskId, completedById: user.id },
    });
  }
}
