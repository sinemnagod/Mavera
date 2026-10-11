import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type AuthUser, requireLocation } from '../common/auth-user.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  // Open tickets, oldest first, so the longest-waiting order is at the top.
  async list(user: AuthUser) {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        status: { in: ['NEW', 'STARTED', 'READY'] },
        order: { locationId: requireLocation(user) },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        order: {
          include: {
            table: true,
            items: { include: { menuItem: true }, orderBy: { id: 'asc' } },
          },
        },
      },
    });

    return tickets.map((ticket) => ({
      id: ticket.id,
      status: ticket.status,
      createdAt: ticket.createdAt,
      startedAt: ticket.startedAt,
      readyAt: ticket.readyAt,
      tableCode: ticket.order.table.code,
      covers: ticket.order.covers,
      flags: ticket.order.flags,
      items: ticket.order.items.map((item) => ({
        id: item.id,
        name: item.menuItem.name,
        station: item.menuItem.station,
        allergens: item.menuItem.allergens,
        quantity: item.quantity,
        modifiers: item.modifiers,
        note: item.note,
      })),
    }));
  }

  async start(user: AuthUser, ticketId: string) {
    const ticket = await this.find(user, ticketId);
    if (ticket.status !== 'NEW') throw new ConflictException('This ticket was already started');
    return this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'STARTED', startedAt: new Date() },
    });
  }

  // Ready also tells the waiter: the table goes to READY on their floor plan.
  async ready(user: AuthUser, ticketId: string) {
    const ticket = await this.find(user, ticketId);
    if (ticket.status === 'READY' || ticket.status === 'BUMPED') {
      throw new ConflictException('This ticket is already ready');
    }
    const [updated] = await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: 'READY', readyAt: new Date() },
      }),
      this.prisma.diningTable.update({
        where: { id: ticket.order.tableId },
        data: { status: 'READY' },
      }),
    ]);
    return updated;
  }

  async bump(user: AuthUser, ticketId: string) {
    const ticket = await this.find(user, ticketId);
    if (ticket.status !== 'READY') throw new ConflictException('Mark the ticket ready first');
    return this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'BUMPED', bumpedAt: new Date() },
    });
  }

  private async find(user: AuthUser, ticketId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, order: { locationId: requireLocation(user) } },
      include: { order: true },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }
}
