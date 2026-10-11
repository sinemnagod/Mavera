import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import type { AuthUser } from '../common/auth-user.js';
import { CurrentUser, Roles } from '../common/decorators.js';
import { parse } from '../common/zod.js';
import { OrdersService } from './orders.service.js';

const orderSchema = z.object({
  tableId: z.string().min(1),
  flags: z.array(z.enum(['ALLERGY', 'RUSH', 'VIP', 'LARGE_PARTY'])).default([]),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
        modifiers: z.array(z.string().max(40)).max(6).default([]),
        note: z.string().max(200).optional(),
      }),
    )
    .min(1, 'Add at least one item')
    .max(40),
});

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Roles('WAITER')
  @Post()
  @HttpCode(201)
  send(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.orders.send(user, parse(orderSchema, body));
  }

  @Roles('WAITER')
  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orders.get(user, id);
  }
}
