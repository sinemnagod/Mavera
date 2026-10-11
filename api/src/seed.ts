// Loads the generated seed data into the database. Run with `npm run db:seed`.
// It wipes and refills every table, so running it again restores the clean demo state.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from './auth/password.js';
import { PrismaClient } from './generated/prisma/client.js';
import type {
  MovementReason,
  Role,
  Station,
} from './generated/prisma/enums.js';

if (existsSync('.env')) process.loadEnvFile();

// One sign-in password per demo account. Change them to whatever you like.
// This file is committed to GitHub, so these are public: use throwaway passwords
// that you do not use anywhere else.
const DEMO_PASSWORDS: Record<string, string> = {
  'gm@mavera.test': 'Gm-demo-2026',
  'waiter@mavera.test': 'Waiter-demo-2026',
  'kitchen@mavera.test': 'Kitchen-demo-2026',
  'cleaner@mavera.test': 'Cleaner-demo-2026',
  'store@mavera.test': 'Store-demo-2026',
  'store.nisantasi@mavera.test': 'Store-nisantasi-2026',
  'store.bebek@mavera.test': 'Store-bebek-2026',
  'store.besiktas@mavera.test': 'Store-besiktas-2026',
  'store.uskudar@mavera.test': 'Store-uskudar-2026',
};

interface LocationSeed {
  id: string;
  name: string;
  staff: { waiter: string; expo: string; cleaner: string; storeManager: string };
  tables: { id: string; section: string; seats: number }[];
}
interface MenuSeed {
  id: string;
  name: string;
  category: string;
  price: number;
  station: string;
  allergens: string[];
  prepMinutes: number;
}
interface IngredientSeed {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  parLevel: number;
  reorderPoint: number;
}
interface RecipeSeed {
  menuItemId: string;
  ingredientId: string;
  quantity: number;
}
interface TaskSeed {
  area: string;
  description: string;
  dueTime: string;
  frequency: string;
}
interface SalesSeed {
  byLocation: Record<
    string,
    {
      days: {
        date: string;
        revenue: number;
        covers: number;
        orders: number;
        avgTicketMinutes: number;
        hourlyCovers: number[];
        itemsSold: Record<string, number>;
      }[];
      itemPrep: Record<string, { avgMinutes: number; p90Minutes: number }>;
      prepTimeDistribution: { label: string; count: number }[];
    }
  >;
}
interface StockSeed {
  byLocation: Record<
    string,
    {
      counts: {
        ingredientId: string;
        weekEnding: string;
        counted: number;
        countedBy: string;
      }[];
      movements: {
        ingredientId: string;
        quantity: number;
        reason: string;
        timestamp: string;
        note?: string;
      }[];
    }
  >;
}
interface CleaningSeed {
  byLocation: Record<
    string,
    { date: string; due: number; completed: number; onTime: number }[]
  >;
}

function readSeed<T>(file: string): T {
  return JSON.parse(readFileSync(join('prisma', 'seed-data', file), 'utf8')) as T;
}

function chunks<T>(items: T[], size = 1000): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

// The seed files store times as local clock readings; we keep them as-is by reading them as UTC.
const asDate = (value: string) =>
  new Date(value.includes('T') ? `${value}Z` : `${value}T00:00:00Z`);

// Copy only the columns we want. The seed file has its own `id`, which would clash
// between locations; the database creates a fresh id for every task instead.
const taskRow = (task: TaskSeed, versionId: string) => ({
  area: task.area,
  description: task.description,
  dueTime: task.dueTime,
  frequency: task.frequency,
  versionId,
});

const connectionString = process.env.DIRECT_URL;
if (!connectionString) throw new Error('DIRECT_URL is missing. Check api/.env');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const locations = readSeed<LocationSeed[]>('locations.json');
  const menu = readSeed<MenuSeed[]>('menu.json');
  const ingredients = readSeed<IngredientSeed[]>('ingredients.json');
  const recipes = readSeed<RecipeSeed[]>('recipes.json');
  const tasks = readSeed<TaskSeed[]>('cleaning-tasks.json');
  const sales = readSeed<SalesSeed>('sales-history.json');
  const stock = readSeed<StockSeed>('stock-history.json');
  const cleaning = readSeed<CleaningSeed>('cleaning-history.json');

  console.log('Clearing old data…');
  // Children first, then the things they point to.
  await prisma.spillReport.deleteMany();
  await prisma.taskCompletion.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.checklistTask.deleteMany();
  await prisma.checklistVersion.deleteMany();
  await prisma.diningTable.deleteMany();
  await prisma.user.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stockCount.deleteMany();
  await prisma.recipeLine.deleteMany();
  await prisma.itemPrepStat.deleteMany();
  await prisma.prepTimeBucket.deleteMany();
  await prisma.cleaningDay.deleteMany();
  await prisma.dailySales.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.location.deleteMany();

  console.log('Locations, tables, menu, ingredients, recipes…');
  await prisma.location.createMany({
    data: locations.map(({ id, name }) => ({ id, name })),
  });
  await prisma.diningTable.createMany({
    data: locations.flatMap((location) =>
      location.tables.map((table) => ({
        locationId: location.id,
        code: table.id,
        section: table.section,
        seats: table.seats,
      })),
    ),
  });
  await prisma.menuItem.createMany({
    data: menu.map((item) => ({
      ...item,
      station: item.station.toUpperCase() as Station,
    })),
  });
  await prisma.ingredient.createMany({ data: ingredients });
  await prisma.recipeLine.createMany({ data: recipes });

  console.log('Demo accounts…');
  // Each account gets its own password, scrambled (hashed) before it is stored.
  const account = async (
    email: string,
    name: string,
    role: Role,
    locationId: string | null,
  ) => {
    const password = DEMO_PASSWORDS[email];
    if (!password) throw new Error(`No demo password set for ${email}`);
    return { email, name, role, locationId, passwordHash: await hashPassword(password) };
  };

  const kadikoy = locations.find((l) => l.id === 'kadikoy')!;
  await prisma.user.createMany({
    data: await Promise.all([
      account('gm@mavera.test', 'Aylin Demirci', 'GENERAL_MANAGER', null),
      account('waiter@mavera.test', kadikoy.staff.waiter, 'WAITER', 'kadikoy'),
      account('kitchen@mavera.test', kadikoy.staff.expo, 'KITCHEN', 'kadikoy'),
      account('cleaner@mavera.test', kadikoy.staff.cleaner, 'CLEANER', 'kadikoy'),
      account('store@mavera.test', kadikoy.staff.storeManager, 'STORE_MANAGER', 'kadikoy'),
      ...locations
        .filter((l) => l.id !== 'kadikoy')
        .map((l) =>
          account(`store.${l.id}@mavera.test`, l.staff.storeManager, 'STORE_MANAGER', l.id),
        ),
    ]),
  });

  console.log('Cleaning checklists…');
  const gm = await prisma.user.findUniqueOrThrow({ where: { email: 'gm@mavera.test' } });
  const storeManagers = await prisma.user.findMany({ where: { role: 'STORE_MANAGER' } });
  for (const location of locations) {
    const manager = storeManagers.find((m) => m.locationId === location.id)!;
    const approved = await prisma.checklistVersion.create({
      data: {
        locationId: location.id,
        version: 1,
        status: 'APPROVED',
        submittedById: manager.id,
        decidedById: gm.id,
        decidedAt: new Date(),
      },
    });
    await prisma.checklistTask.createMany({
      data: tasks.map((t) => taskRow(t, approved.id)),
    });
  }
  // Two locations have a new version waiting for the GM to approve.
  for (const locationId of ['nisantasi', 'bebek']) {
    const manager = storeManagers.find((m) => m.locationId === locationId)!;
    const pending = await prisma.checklistVersion.create({
      data: { locationId, version: 2, status: 'PENDING', submittedById: manager.id },
    });
    await prisma.checklistTask.createMany({
      data: [
        ...tasks,
        { area: 'Kitchen', description: 'Check fridge temperatures', dueTime: '12:00', frequency: 'daily' },
      ].map((t) => taskRow(t, pending.id)),
    });
  }

  console.log('Ten weeks of history…');
  for (const location of locations) {
    const salesData = sales.byLocation[location.id];
    await prisma.dailySales.createMany({
      data: salesData.days.map((day) => ({
        ...day,
        locationId: location.id,
        date: asDate(day.date),
      })),
    });
    await prisma.itemPrepStat.createMany({
      data: Object.entries(salesData.itemPrep).map(([menuItemId, stat]) => ({
        locationId: location.id,
        menuItemId,
        ...stat,
      })),
    });
    await prisma.prepTimeBucket.createMany({
      data: salesData.prepTimeDistribution.map((bucket, position) => ({
        locationId: location.id,
        position,
        ...bucket,
      })),
    });

    const stockData = stock.byLocation[location.id];
    await prisma.stockCount.createMany({
      data: stockData.counts.map((count) => ({
        ...count,
        locationId: location.id,
        weekEnding: asDate(count.weekEnding),
      })),
    });
    for (const batch of chunks(stockData.movements)) {
      await prisma.stockMovement.createMany({
        data: batch.map((movement) => ({
          ...movement,
          locationId: location.id,
          reason: movement.reason.toUpperCase() as MovementReason,
          timestamp: asDate(movement.timestamp),
        })),
      });
    }

    await prisma.cleaningDay.createMany({
      data: cleaning.byLocation[location.id].map((day) => ({
        ...day,
        locationId: location.id,
        date: asDate(day.date),
      })),
    });
  }

  const [users, tables, counts, movements, days] = await Promise.all([
    prisma.user.count(),
    prisma.diningTable.count(),
    prisma.stockCount.count(),
    prisma.stockMovement.count(),
    prisma.dailySales.count(),
  ]);
  console.log(
    `Done: ${users} users, ${tables} tables, ${counts} stock counts, ${movements} movements, ${days} sales days.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
