import { Injectable } from '@nestjs/common';
import { type AuthUser, requireLocation } from '../common/auth-user.js';
import { PrismaService } from '../prisma/prisma.service.js';

const DAY = 24 * 60 * 60 * 1000;
const iso = (date: Date) => date.toISOString().slice(0, 10);

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  // Current stock = the latest weekly count. Below reorder point comes first, then below par.
  async current(user: AuthUser) {
    const locationId = requireLocation(user);
    const [ingredients, counts] = await Promise.all([
      this.prisma.ingredient.findMany(),
      this.prisma.stockCount.findMany({ where: { locationId }, orderBy: { weekEnding: 'desc' } }),
    ]);
    const latest = new Map<string, (typeof counts)[number]>();
    for (const count of counts) if (!latest.has(count.ingredientId)) latest.set(count.ingredientId, count);

    const rank = { reorder: 0, low: 1, ok: 2 } as const;
    return ingredients
      .map((ingredient) => {
        const count = latest.get(ingredient.id);
        const counted = count?.counted ?? 0;
        const status: 'reorder' | 'low' | 'ok' =
          counted < ingredient.reorderPoint ? 'reorder' : counted < ingredient.parLevel ? 'low' : 'ok';
        return {
          id: ingredient.id,
          name: ingredient.name,
          unit: ingredient.unit,
          counted,
          countedOn: count ? iso(count.weekEnding) : null,
          parLevel: ingredient.parLevel,
          reorderPoint: ingredient.reorderPoint,
          status,
        };
      })
      .sort((a, b) => rank[a.status] - rank[b.status] || a.name.localeCompare(b.name));
  }

  // A grid of weekly counts: one row per ingredient, one column per week.
  async counts(user: AuthUser) {
    const locationId = requireLocation(user);
    const [ingredients, counts] = await Promise.all([
      this.prisma.ingredient.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.stockCount.findMany({ where: { locationId } }),
    ]);
    const weeks = [...new Set(counts.map((c) => iso(c.weekEnding)))].sort().reverse();
    const byKey = new Map(counts.map((c) => [`${c.ingredientId}|${iso(c.weekEnding)}`, c.counted]));
    return {
      weeks,
      rows: ingredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        unit: ingredient.unit,
        values: weeks.map((week) => byKey.get(`${ingredient.id}|${week}`) ?? null),
      })),
    };
  }

  // Every stock change with a reason, newest first.
  async movements(user: AuthUser) {
    const rows = await this.prisma.stockMovement.findMany({
      where: { locationId: requireLocation(user) },
      orderBy: { timestamp: 'desc' },
      take: 200,
      include: { ingredient: { select: { name: true, unit: true } } },
    });
    return rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      ingredient: row.ingredient.name,
      unit: row.ingredient.unit,
      quantity: row.quantity,
      reason: row.reason,
      note: row.note,
    }));
  }

  // Flow 5. Theoretical use comes from what was sold. Actual use comes from the shelf:
  // what was there + what arrived - what is there now. The gap is waste, staff meals and error.
  async variance(user: AuthUser) {
    const locationId = requireLocation(user);
    const latest = await this.prisma.stockCount.findFirst({
      where: { locationId },
      orderBy: { weekEnding: 'desc' },
    });
    if (!latest) return { weekEnding: null, rows: [] };

    const end = latest.weekEnding;
    const start = new Date(end.getTime() - 7 * DAY);
    const [ingredients, recipes, counts, sales, movements] = await Promise.all([
      this.prisma.ingredient.findMany(),
      this.prisma.recipeLine.findMany(),
      this.prisma.stockCount.findMany({ where: { locationId, weekEnding: { in: [start, end] } } }),
      this.prisma.dailySales.findMany({
        where: { locationId, date: { gt: start, lte: end } },
      }),
      this.prisma.stockMovement.findMany({
        where: {
          locationId,
          reason: { in: ['RECEIVED', 'TRANSFERRED'] },
          timestamp: { gt: start, lt: new Date(end.getTime() + DAY) },
        },
      }),
    ]);

    const sold = new Map<string, number>();
    for (const day of sales) {
      for (const [menuItemId, units] of Object.entries(day.itemsSold as Record<string, number>)) {
        sold.set(menuItemId, (sold.get(menuItemId) ?? 0) + units);
      }
    }
    const theoretical = new Map<string, number>();
    for (const line of recipes) {
      theoretical.set(
        line.ingredientId,
        (theoretical.get(line.ingredientId) ?? 0) + (sold.get(line.menuItemId) ?? 0) * line.quantity,
      );
    }
    const countAt = (ingredientId: string, date: Date) =>
      counts.find((c) => c.ingredientId === ingredientId && c.weekEnding.getTime() === date.getTime())?.counted ?? 0;
    const arrived = new Map<string, number>();
    for (const m of movements) arrived.set(m.ingredientId, (arrived.get(m.ingredientId) ?? 0) + m.quantity);

    const rows = ingredients.map((ingredient) => {
      const expected = theoretical.get(ingredient.id) ?? 0;
      const actual = countAt(ingredient.id, start) + (arrived.get(ingredient.id) ?? 0) - countAt(ingredient.id, end);
      const gap = actual - expected;
      return {
        id: ingredient.id,
        name: ingredient.name,
        unit: ingredient.unit,
        theoretical: Math.round(expected * 10) / 10,
        actual: Math.round(actual * 10) / 10,
        gap: Math.round(gap * 10) / 10,
        gapPct: expected > 0 ? Math.round((gap / expected) * 1000) / 10 : 0,
        gapValue: Math.round(gap * ingredient.costPerUnit),
      };
    });
    return { weekEnding: iso(end), rows: rows.sort((a, b) => b.gapValue - a.gapValue) };
  }
}
