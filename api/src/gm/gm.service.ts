import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const DAY = 24 * 60 * 60 * 1000;
const iso = (date: Date) => date.toISOString().slice(0, 10);
const round = (value: number, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};
const pctChange = (now: number, before: number) => (before ? round(((now - before) / before) * 100, 1) : 0);

@Injectable()
export class GmService {
  constructor(private readonly prisma: PrismaService) {}

  // The picture across all five locations for the latest week, compared with the week before.
  async overview() {
    const latest = await this.prisma.dailySales.aggregate({ _max: { date: true } });
    const end = latest._max.date;
    if (!end) return { period: null, locations: [], totals: null };

    const thisStart = new Date(end.getTime() - 6 * DAY);
    const prevStart = new Date(end.getTime() - 13 * DAY);
    const endOfLastDay = new Date(end.getTime() + DAY);

    const [locations, sales, cleaning, movements, counts, prep] = await Promise.all([
      this.prisma.location.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.dailySales.findMany({ where: { date: { gte: prevStart, lte: end } } }),
      this.prisma.cleaningDay.findMany({ where: { date: { gte: thisStart, lte: end } } }),
      this.prisma.stockMovement.findMany({
        where: { reason: { in: ['USED', 'WASTED'] }, timestamp: { gte: thisStart, lt: endOfLastDay } },
        include: { ingredient: { select: { costPerUnit: true } } },
      }),
      this.prisma.stockCount.findMany({
        where: { weekEnding: end },
        include: { ingredient: true },
      }),
      this.prisma.itemPrepStat.findMany({ include: { menuItem: true } }),
    ]);

    const inRange = (date: Date, from: Date, to: Date) => date >= from && date <= to;
    const summary = locations.map((location) => {
      const mine = sales.filter((s) => s.locationId === location.id);
      const now = mine.filter((s) => inRange(s.date, thisStart, end));
      const before = mine.filter((s) => inRange(s.date, prevStart, new Date(thisStart.getTime() - DAY)));
      const revenue = now.reduce((sum, s) => sum + s.revenue, 0);
      const covers = now.reduce((sum, s) => sum + s.covers, 0);
      const prevRevenue = before.reduce((sum, s) => sum + s.revenue, 0);
      const prevCovers = before.reduce((sum, s) => sum + s.covers, 0);

      const money = movements.filter((m) => m.locationId === location.id);
      const value = (reason: string) =>
        money
          .filter((m) => m.reason === reason)
          .reduce((sum, m) => sum + Math.abs(m.quantity) * m.ingredient.costPerUnit, 0);
      const used = value('USED');
      const days = cleaning.filter((c) => c.locationId === location.id);
      const due = days.reduce((sum, c) => sum + c.due, 0);

      return {
        id: location.id,
        name: location.name,
        revenue,
        revenueChangePct: pctChange(revenue, prevRevenue),
        covers,
        coversChangePct: pctChange(covers, prevCovers),
        avgSpend: covers ? round(revenue / covers) : 0,
        avgTicketMinutes: now.length ? round(now.reduce((s, d) => s + d.avgTicketMinutes, 0) / now.length, 1) : 0,
        wastePct: used ? round((value('WASTED') / used) * 100, 1) : 0,
        cleaningCompliance: due ? round((days.reduce((s, c) => s + c.completed, 0) / due) * 100) : 0,
        lowStock: counts
          .filter((c) => c.locationId === location.id && c.counted < c.ingredient.reorderPoint)
          .map((c) => ({
            name: c.ingredient.name,
            counted: c.counted,
            unit: c.ingredient.unit,
            reorderPoint: c.ingredient.reorderPoint,
            parLevel: c.ingredient.parLevel,
          })),
        slowDishes: prep
          .filter((p) => p.locationId === location.id && p.avgMinutes > p.menuItem.prepMinutes * 1.4)
          .map((p) => ({ name: p.menuItem.name, listedMinutes: p.menuItem.prepMinutes, avgMinutes: p.avgMinutes })),
      };
    });

    const totalRevenue = summary.reduce((s, l) => s + l.revenue, 0);
    const totalCovers = summary.reduce((s, l) => s + l.covers, 0);
    const allDue = cleaning.reduce((s, c) => s + c.due, 0);
    return {
      period: { from: iso(thisStart), to: iso(end) },
      locations: summary,
      totals: {
        revenue: totalRevenue,
        covers: totalCovers,
        avgSpend: totalCovers ? round(totalRevenue / totalCovers) : 0,
        avgTicketMinutes: round(summary.reduce((s, l) => s + l.avgTicketMinutes, 0) / (summary.length || 1), 1),
        wastePct: round(summary.reduce((s, l) => s + l.wastePct, 0) / (summary.length || 1), 1),
        cleaningCompliance: allDue ? round((cleaning.reduce((s, c) => s + c.completed, 0) / allDue) * 100) : 0,
      },
    };
  }

  // One location in depth: four weeks of trend, best and worst dishes, and the day's rhythm.
  async location(locationId: string) {
    const location = await this.prisma.location.findUnique({ where: { id: locationId } });
    if (!location) throw new NotFoundException('Location not found');

    const sales = await this.prisma.dailySales.findMany({
      where: { locationId },
      orderBy: { date: 'desc' },
      take: 28,
    });
    sales.reverse();

    const [menu, buckets, prep, overview] = await Promise.all([
      this.prisma.menuItem.findMany(),
      this.prisma.prepTimeBucket.findMany({ where: { locationId }, orderBy: { position: 'asc' } }),
      this.prisma.itemPrepStat.findMany({ where: { locationId }, include: { menuItem: true } }),
      this.overview(),
    ]);
    const nameOf = new Map(menu.map((m) => [m.id, m]));

    const units = new Map<string, number>();
    for (const day of sales) {
      for (const [id, count] of Object.entries(day.itemsSold as Record<string, number>)) {
        units.set(id, (units.get(id) ?? 0) + count);
      }
    }
    const ranked = [...units.entries()]
      .map(([id, count]) => ({ name: nameOf.get(id)?.name ?? id, units: count, revenue: count * (nameOf.get(id)?.price ?? 0) }))
      .sort((a, b) => b.units - a.units);

    const hourly = Array.from({ length: 12 }, (_, i) => ({
      hour: `${String(11 + i).padStart(2, '0')}:00`,
      avgCovers: round(sales.reduce((sum, d) => sum + (d.hourlyCovers as number[])[i], 0) / (sales.length || 1), 1),
    }));

    const summary = overview.locations.find((l) => l.id === locationId);
    return {
      id: location.id,
      name: location.name,
      summary,
      trend: sales.map((d) => ({ date: iso(d.date), revenue: d.revenue, covers: d.covers })),
      topItems: ranked.slice(0, 5),
      bottomItems: ranked.slice(-5).reverse(),
      prepDistribution: buckets.map((b) => ({ label: b.label, count: b.count })),
      hourly,
      slowDishes: prep
        .filter((p) => p.avgMinutes > p.menuItem.prepMinutes * 1.25)
        .map((p) => ({ name: p.menuItem.name, listedMinutes: p.menuItem.prepMinutes, avgMinutes: p.avgMinutes, p90Minutes: p.p90Minutes })),
    };
  }
}
