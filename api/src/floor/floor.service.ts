import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type AuthUser, requireLocation } from '../common/auth-user.js';
import { PrismaService } from '../prisma/prisma.service.js';

const SECTION_ORDER = ['main', 'terrace', 'family'];

@Injectable()
export class FloorService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser) {
    const locationId = requireLocation(user);
    const [tables, activeOrders] = await Promise.all([
      this.prisma.diningTable.findMany({ where: { locationId } }),
      this.prisma.order.findMany({
        where: { locationId, status: { in: ['OPEN', 'SENT'] } },
        select: { id: true, tableId: true, ticket: { select: { status: true, readyAt: true } } },
      }),
    ]);
    const orderByTable = new Map(activeOrders.map((order) => [order.tableId, order]));

    return tables
      .map((table) => {
        const order = orderByTable.get(table.id);
        return {
          id: table.id,
          code: table.code,
          section: table.section,
          seats: table.seats,
          status: table.status,
          covers: table.covers,
          orderId: order?.id ?? null,
          ticketStatus: order?.ticket?.status ?? null,
          readyAt: order?.ticket?.readyAt ?? null,
        };
      })
      .sort(
        (a, b) =>
          SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section) ||
          Number(a.code.slice(1)) - Number(b.code.slice(1)),
      );
  }

  async seat(user: AuthUser, tableId: string, covers: number) {
    const table = await this.getTable(user, tableId);
    if (table.status !== 'FREE') throw new ConflictException('This table is already in use');
    if (covers > table.seats + 4) {
      throw new ConflictException(`This table seats ${table.seats}`);
    }
    return this.prisma.diningTable.update({
      where: { id: table.id },
      data: { status: 'SEATED', covers },
    });
  }

  async requestCheck(user: AuthUser, tableId: string) {
    const table = await this.getTable(user, tableId);
    return this.prisma.diningTable.update({
      where: { id: table.id },
      data: { status: 'CHECK_REQUESTED' },
    });
  }

  async close(user: AuthUser, tableId: string) {
    const table = await this.getTable(user, tableId);
    const [, updated] = await this.prisma.$transaction([
      this.prisma.order.updateMany({
        where: { tableId: table.id, status: { in: ['OPEN', 'SENT'] } },
        data: { status: 'CLOSED', closedAt: new Date() },
      }),
      this.prisma.diningTable.update({
        where: { id: table.id },
        data: { status: 'FREE', covers: null },
      }),
    ]);
    return updated;
  }

  // Looking the table up with the user's location is what stops a waiter
  // at one restaurant from touching another restaurant's tables.
  private async getTable(user: AuthUser, tableId: string) {
    const table = await this.prisma.diningTable.findFirst({
      where: { id: tableId, locationId: requireLocation(user) },
    });
    if (!table) throw new NotFoundException('Table not found');
    return table;
  }
}
