import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { type AuthUser, requireLocation } from '../common/auth-user.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface NewOrder {
  tableId: string;
  flags: string[];
  items: { menuItemId: string; quantity: number; modifiers: string[]; note?: string }[];
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // Sends the order to the kitchen. If the table already has an order, the new
  // items are added to it and the kitchen sees the ticket come back as new.
  async send(user: AuthUser, input: NewOrder) {
    const locationId = requireLocation(user);
    const table = await this.prisma.diningTable.findFirst({
      where: { id: input.tableId, locationId },
    });
    if (!table) throw new NotFoundException('Table not found');
    if (table.status === 'FREE') throw new BadRequestException('Seat the table first');

    const ids = [...new Set(input.items.map((item) => item.menuItemId))];
    const found = await this.prisma.menuItem.count({ where: { id: { in: ids } } });
    if (found !== ids.length) throw new BadRequestException('Unknown menu item');

    const existing = await this.prisma.order.findFirst({
      where: { tableId: table.id, status: { in: ['OPEN', 'SENT'] } },
    });
    const itemRows = input.items.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      modifiers: item.modifiers,
      note: item.note,
    }));

    const orderId = await this.prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.orderItem.createMany({
          data: itemRows.map((row) => ({ ...row, orderId: existing.id })),
        });
        await tx.order.update({
          where: { id: existing.id },
          data: { flags: [...new Set([...existing.flags, ...input.flags])] },
        });
        await tx.ticket.update({
          where: { orderId: existing.id },
          data: { status: 'NEW', startedAt: null, readyAt: null, bumpedAt: null },
        });
        await tx.diningTable.update({ where: { id: table.id }, data: { status: 'ORDERED' } });
        return existing.id;
      }

      const order = await tx.order.create({
        data: {
          locationId,
          tableId: table.id,
          createdById: user.id,
          status: 'SENT',
          sentAt: new Date(),
          covers: table.covers ?? 1,
          flags: input.flags,
          items: { create: itemRows },
          ticket: { create: {} },
        },
      });
      await tx.diningTable.update({ where: { id: table.id }, data: { status: 'ORDERED' } });
      return order.id;
    });

    return this.get(user, orderId);
  }

  async get(user: AuthUser, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, locationId: requireLocation(user) },
      include: {
        table: true,
        ticket: true,
        items: { include: { menuItem: true }, orderBy: { id: 'asc' } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    return {
      id: order.id,
      status: order.status,
      flags: order.flags,
      covers: order.covers,
      sentAt: order.sentAt,
      table: { id: order.table.id, code: order.table.code, status: order.table.status },
      ticket: order.ticket && {
        status: order.ticket.status,
        readyAt: order.ticket.readyAt,
      },
      total: order.items.reduce((sum, item) => sum + item.quantity * item.menuItem.price, 0),
      items: order.items.map((item) => ({
        id: item.id,
        name: item.menuItem.name,
        station: item.menuItem.station,
        price: item.menuItem.price,
        quantity: item.quantity,
        modifiers: item.modifiers,
        note: item.note,
      })),
    };
  }
}
