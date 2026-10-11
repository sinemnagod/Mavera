// Generates the seed data in api/prisma/seed-data/. Run with `npm run seed:data`.
// Same SEED in, byte-identical JSON out — so every reviewer sees the same restaurants.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SEED = 20260821;
const START_DATE = "2026-07-27"; // a Monday, so history is ten whole Monday–Sunday weeks
const WEEKS = 10;
const DAYS = WEEKS * 7;
const BASE_COVERS = 230; // covers on an average day at a location with covers multiplier 1.0

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "seed-data");

// ---------------------------------------------------------------------------
// Random numbers and small helpers
// ---------------------------------------------------------------------------

function hashString(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// One independent stream per name, so changing how one section draws numbers
// never reshuffles the data in another section.
function createRng(name) {
  let a = (SEED ^ hashString(name)) | 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value, places = 2) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const between = (rng, min, max) => min + (max - min) * rng();

// Box–Muller: turns two uniform numbers into one bell-curve number.
function normal(rng, mean, sd) {
  const u = 1 - rng();
  const v = rng();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function addDays(date, count) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + count);
  return d.toISOString().slice(0, 10);
}
const dayOfWeek = (date) => new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = Sunday

// ---------------------------------------------------------------------------
// Menu — ~30 items, each tagged to a station. No alcohol: Mavera doesn't serve it.
// ---------------------------------------------------------------------------

function item(id, name, category, price, station, allergens, prepMinutes) {
  return { id, name, category, price, station, allergens, prepMinutes };
}

const MENU = [
  item("hummus", "Humus", "Starters", 145, "cold", ["sesame"], 4),
  item("haydari", "Haydari", "Starters", 135, "cold", ["dairy"], 4),
  item("acili-ezme", "Acılı Ezme", "Starters", 120, "cold", [], 4),
  item("patlican-salata", "Közlenmiş Patlıcan Salatası", "Starters", 150, "cold", [], 5),
  item("yaprak-sarma", "Zeytinyağlı Yaprak Sarma", "Starters", 160, "cold", [], 5),
  item("sigara-boregi", "Sigara Böreği", "Starters", 165, "grill", ["gluten", "dairy"], 9),
  item("kalamar", "Kalamar Tava", "Starters", 285, "grill", ["gluten", "shellfish"], 12),
  item("mercimek", "Mercimek Çorbası", "Starters", 110, "grill", [], 5),
  item("coban-salata", "Çoban Salatası", "Salads", 125, "cold", [], 5),
  item("gavurdagi", "Gavurdağı Salatası", "Salads", 155, "cold", ["nuts"], 6),
  item("roka-peynir", "Roka Peynir Salatası", "Salads", 170, "cold", ["dairy"], 5),
  item("adana", "Adana Kebap", "Mains", 395, "grill", [], 16),
  item("urfa", "Urfa Kebap", "Mains", 395, "grill", [], 16),
  item("kuzu-sis", "Kuzu Şiş", "Mains", 485, "grill", [], 18),
  // The slow-prep dish: listed at 20 minutes, actually takes ~30 (see itemPrep below).
  item("kuzu-tandir", "Kuzu Tandır", "Mains", 545, "grill", [], 20),
  item("tavuk-sis", "Tavuk Şiş", "Mains", 340, "grill", [], 15),
  item("kofte", "Izgara Köfte", "Mains", 355, "grill", ["gluten", "egg"], 15),
  item("iskender", "İskender", "Mains", 425, "grill", ["gluten", "dairy"], 17),
  item("levrek", "Izgara Levrek", "Mains", 465, "grill", ["fish"], 18),
  item("karisik-izgara", "Karışık Izgara", "Mains", 620, "grill", [], 22),
  item("manti", "Mantı", "Mains", 255, "grill", ["gluten", "dairy", "egg"], 14),
  item("pide", "Kaşarlı Pide", "Mains", 245, "grill", ["gluten", "dairy", "egg"], 13),
  item("pilav", "Bulgur Pilavı", "Sides", 85, "grill", ["gluten"], 4),
  item("patates", "Patates Kızartması", "Sides", 95, "grill", [], 7),
  item("baklava", "Fıstıklı Baklava", "Desserts", 195, "dessert", ["gluten", "nuts"], 3),
  item("kunefe", "Künefe", "Desserts", 225, "dessert", ["gluten", "dairy", "nuts"], 11),
  item("sutlac", "Fırın Sütlaç", "Desserts", 150, "dessert", ["dairy"], 3),
  item("kazandibi", "Kazandibi", "Desserts", 155, "dessert", ["dairy"], 3),
  item("cay", "Çay", "Drinks", 40, "cold", [], 2),
  item("turk-kahvesi", "Türk Kahvesi", "Drinks", 85, "cold", [], 5),
  item("ayran", "Ayran", "Drinks", 60, "cold", ["dairy"], 1),
  item("limonata", "Ev Yapımı Limonata", "Drinks", 95, "cold", [], 2),
];

// How often each dish is ordered relative to the others. Not exported — it only shapes the sales history.
const POPULARITY = {
  hummus: 6, haydari: 6, "acili-ezme": 5, "patlican-salata": 4, "yaprak-sarma": 4,
  "sigara-boregi": 7, kalamar: 5, mercimek: 5, "coban-salata": 7, gavurdagi: 5, "roka-peynir": 3,
  adana: 8, urfa: 5, "kuzu-sis": 5, "kuzu-tandir": 3, "tavuk-sis": 7, kofte: 7, iskender: 6,
  levrek: 3, "karisik-izgara": 4, manti: 4, pide: 5, pilav: 5, patates: 5,
  baklava: 4, kunefe: 5, sutlac: 3, kazandibi: 2,
  cay: 14, "turk-kahvesi": 7, ayran: 8, limonata: 6,
};

const LAMB_DISHES = ["adana", "urfa", "kuzu-sis", "kuzu-tandir", "karisik-izgara"];
const DESSERTS = ["baklava", "kunefe", "sutlac", "kazandibi"];

// ---------------------------------------------------------------------------
// Ingredients and recipes — 22 key ingredients, counted weekly (not decremented per order)
// ---------------------------------------------------------------------------

// [id, name, unit, cost per unit in TRY, share lost to spoilage/over-portioning in a normal week]
const INGREDIENT_ROWS = [
  ["lamb", "Lamb", "kg", 620, 0.03],
  ["beef-mince", "Beef mince", "kg", 430, 0.035],
  ["chicken", "Chicken", "kg", 190, 0.04],
  ["sea-bass", "Sea bass", "kg", 520, 0.06],
  ["squid", "Squid", "kg", 380, 0.06],
  ["yogurt", "Yogurt", "kg", 70, 0.04],
  ["white-cheese", "White cheese", "kg", 220, 0.03],
  ["kashar", "Kaşar cheese", "kg", 310, 0.02],
  ["flour", "Flour", "kg", 22, 0.01],
  ["bulgur", "Bulgur", "kg", 38, 0.01],
  ["rice", "Rice", "kg", 55, 0.01],
  ["chickpeas", "Chickpeas", "kg", 60, 0.01],
  ["eggplant", "Eggplant", "kg", 35, 0.07],
  ["tomato", "Tomato", "kg", 40, 0.07],
  ["potato", "Potato", "kg", 20, 0.03],
  ["rocket", "Rocket", "kg", 90, 0.1],
  ["pistachio", "Pistachio", "kg", 1100, 0.015],
  ["kadayif", "Kadayıf", "kg", 120, 0.02],
  ["milk", "Milk", "L", 38, 0.04],
  ["butter", "Butter", "kg", 360, 0.01],
  ["olive-oil", "Olive oil", "L", 280, 0.01],
  ["tahini", "Tahini", "kg", 240, 0.01],
];

// Staff meals eat a bit of everything; these are the staples that go most.
const STAFF_MEAL_SHARE = { chicken: 0.03, rice: 0.03, bulgur: 0.03, potato: 0.03, "beef-mince": 0.02 };
const DEFAULT_STAFF_MEAL_SHARE = 0.012;

// menu item → [ingredient, quantity per portion in the ingredient's unit]
const RECIPES = {
  hummus: [["chickpeas", 0.08], ["tahini", 0.03], ["olive-oil", 0.01]],
  haydari: [["yogurt", 0.12], ["white-cheese", 0.03]],
  "acili-ezme": [["tomato", 0.15], ["olive-oil", 0.01]],
  "patlican-salata": [["eggplant", 0.2], ["olive-oil", 0.015], ["yogurt", 0.03]],
  "yaprak-sarma": [["rice", 0.06], ["olive-oil", 0.02]],
  "sigara-boregi": [["flour", 0.05], ["white-cheese", 0.06], ["butter", 0.01]],
  kalamar: [["squid", 0.2], ["flour", 0.04], ["olive-oil", 0.05]],
  mercimek: [["butter", 0.01], ["olive-oil", 0.005]],
  "coban-salata": [["tomato", 0.2], ["olive-oil", 0.01]],
  gavurdagi: [["tomato", 0.18], ["olive-oil", 0.015]],
  "roka-peynir": [["rocket", 0.08], ["white-cheese", 0.07], ["olive-oil", 0.01]],
  adana: [["lamb", 0.18], ["tomato", 0.1]],
  urfa: [["lamb", 0.18], ["tomato", 0.08]],
  "kuzu-sis": [["lamb", 0.25], ["tomato", 0.1]],
  "kuzu-tandir": [["lamb", 0.4], ["bulgur", 0.08], ["butter", 0.01]],
  "tavuk-sis": [["chicken", 0.25], ["tomato", 0.1]],
  kofte: [["beef-mince", 0.2], ["flour", 0.01], ["tomato", 0.1]],
  iskender: [["beef-mince", 0.15], ["yogurt", 0.08], ["butter", 0.03], ["tomato", 0.1], ["flour", 0.06]],
  levrek: [["sea-bass", 0.3], ["olive-oil", 0.02], ["rocket", 0.03]],
  "karisik-izgara": [["lamb", 0.2], ["chicken", 0.1], ["beef-mince", 0.1], ["tomato", 0.1]],
  manti: [["flour", 0.1], ["beef-mince", 0.06], ["yogurt", 0.1], ["butter", 0.02]],
  pide: [["flour", 0.15], ["kashar", 0.1], ["butter", 0.01]],
  pilav: [["bulgur", 0.08], ["butter", 0.01]],
  patates: [["potato", 0.25], ["olive-oil", 0.05]],
  baklava: [["flour", 0.05], ["pistachio", 0.03], ["butter", 0.04]],
  kunefe: [["kadayif", 0.1], ["kashar", 0.08], ["pistachio", 0.02], ["butter", 0.03]],
  sutlac: [["milk", 0.2], ["rice", 0.03]],
  kazandibi: [["milk", 0.25], ["flour", 0.02]],
  ayran: [["yogurt", 0.1]],
};

// ---------------------------------------------------------------------------
// Locations — the deliberate patterns live here
// ---------------------------------------------------------------------------

const SECTIONS = [
  { id: "main", label: "Main", prefix: "M" },
  { id: "terrace", label: "Terrace", prefix: "T" },
  { id: "family", label: "Family", prefix: "F" },
];
const SEAT_CYCLES = {
  main: [2, 2, 4, 4, 2, 4, 6, 4],
  terrace: [2, 4, 2, 4, 6, 4, 2, 6],
  family: [6, 8, 6, 8, 10, 6],
};

// covers: size vs. baseline · trend: covers drift over the 10 weeks · waste: spoilage multiplier
// slowMinutes: extra ticket minutes · compliance/complianceTrend: share of cleaning tasks done
const LOCATIONS = [
  {
    id: "kadikoy", name: "Kadıköy", tableCounts: { main: 12, terrace: 8, family: 6 },
    staff: { waiter: "Deniz Aksoy", expo: "Murat Özkan", cleaner: "Ayşe Demir", storeManager: "Elif Kaya" },
    profile: { covers: 1.0, trend: 0.02, waste: 1.0, slowMinutes: 0, compliance: 0.94, complianceTrend: 0, itemsPerCover: 2.4, popularity: {} },
  },
  {
    id: "nisantasi", name: "Nişantaşı", tableCounts: { main: 14, terrace: 6, family: 6 },
    staff: { waiter: "Zeynep Arslan", expo: "Can Yılmaz", cleaner: "Fatma Şahin", storeManager: "Burak Çelik" },
    profile: {
      covers: 1.08, trend: 0.06, waste: 0.85, slowMinutes: -0.5, compliance: 0.96, complianceTrend: 0, itemsPerCover: 2.6,
      popularity: { ...Object.fromEntries(DESSERTS.map((id) => [id, 1.35])), levrek: 1.3 },
    },
  },
  {
    id: "bebek", name: "Bebek", tableCounts: { main: 10, terrace: 12, family: 6 },
    staff: { waiter: "Selin Koç", expo: "Emre Aydın", cleaner: "Hatice Polat", storeManager: "Ozan Güneş" },
    // Lamb-heavy: this is the location that runs short of lamb (see stock simulation).
    profile: {
      covers: 1.05, trend: 0.03, waste: 1.0, slowMinutes: 0.5, compliance: 0.92, complianceTrend: 0, itemsPerCover: 2.5,
      popularity: Object.fromEntries(LAMB_DISHES.map((id) => [id, 1.4])),
    },
  },
  {
    id: "besiktas", name: "Beşiktaş", tableCounts: { main: 12, terrace: 6, family: 8 },
    staff: { waiter: "Ali Kurt", expo: "Gizem Tan", cleaner: "Hasan Erdem", storeManager: "Merve Bulut" },
    profile: { covers: 0.95, trend: 0.04, waste: 1.1, slowMinutes: 1, compliance: 0.9, complianceTrend: 0, itemsPerCover: 2.3, popularity: {} },
  },
  {
    id: "uskudar", name: "Üsküdar", tableCounts: { main: 10, terrace: 8, family: 4 },
    staff: { waiter: "Kerem Aslan", expo: "Naz Yıldırım", cleaner: "Hülya Karaca", storeManager: "Tolga Doğan" },
    // The underperformer: smaller, shrinking, wasteful, slow, and falling behind on cleaning.
    profile: {
      covers: 0.78, trend: -0.18, waste: 1.9, slowMinutes: 5, compliance: 0.78, complianceTrend: -0.16, itemsPerCover: 2.1,
      popularity: { "kuzu-sis": 0.8, "kuzu-tandir": 0.8 },
    },
  },
];

// Index 0 = Sunday. Weekends rush; Friday and Saturday are the peaks.
const DOW_COVERS = [1.2, 0.7, 0.75, 0.8, 0.9, 1.25, 1.45];
const DOW_TICKET_PENALTY = [2, 0, 0, 0.3, 0.8, 2.5, 3.5]; // busy days run slower
const WEEKDAY_HOURS = [4, 8, 12, 13, 8, 4, 4, 8, 14, 15, 10, 5]; // 11:00 → 22:00
const WEEKEND_HOURS = [2, 5, 8, 10, 8, 5, 5, 9, 15, 18, 13, 7];
const SERVICE_START_HOUR = 11; // hourlyCovers[0] is the 11:00 hour

// ---------------------------------------------------------------------------
// Cleaning checklist — the approved daily list (version 1)
// ---------------------------------------------------------------------------

function task(area, description, dueTime) {
  return { id: `${area.toLowerCase()}-${dueTime.replace(":", "")}`, area, description, dueTime, frequency: "daily" };
}

const CLEANING_TASKS = [
  task("Main", "Wipe and reset all tables", "10:30"),
  task("Main", "Sweep and spot-mop floor", "14:30"),
  task("Main", "Restock napkins, condiments and menus", "17:30"),
  task("Main", "Deep mop and chairs up", "23:30"),
  task("Terrace", "Wipe tables and cushions", "10:30"),
  task("Terrace", "Sweep and empty ashtrays", "15:00"),
  task("Terrace", "Stack chairs and secure umbrellas", "23:30"),
  task("Family", "Wipe tables and high chairs", "10:30"),
  task("Family", "Sanitise play corner", "15:00"),
  task("Family", "Sweep and mop floor", "23:30"),
  task("Kitchen", "Sanitise prep surfaces", "10:00"),
  task("Kitchen", "Clean grill and extractor filters", "16:00"),
  task("Kitchen", "Empty and wash bins", "21:00"),
  task("Kitchen", "Degrease floor and drains", "23:45"),
  task("Kitchen", "Wipe down fridge handles and seals", "13:00"),
  task("Restrooms", "Clean and restock — morning", "11:00"),
  task("Restrooms", "Clean and restock — afternoon", "15:30"),
  task("Restrooms", "Clean and restock — evening", "19:30"),
  task("Restrooms", "Final clean and mop", "23:15"),
  task("Storage", "Sweep and check for pests", "12:00"),
  task("Storage", "Break down cardboard and take out recycling", "22:00"),
  task("Entrance", "Sweep and wipe glass doors", "10:00"),
  task("Entrance", "Wipe host stand and menus", "16:30"),
  task("Entrance", "Mop entrance mat area", "23:00"),
];

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

function buildTables(tableCounts) {
  return SECTIONS.flatMap((section) =>
    Array.from({ length: tableCounts[section.id] }, (_, index) => {
      const cycle = SEAT_CYCLES[section.id];
      return { id: `${section.prefix}${index + 1}`, section: section.id, seats: cycle[index % cycle.length] };
    }),
  );
}

function buildLocations() {
  return LOCATIONS.map(({ id, name, staff, tableCounts }) => ({
    id,
    name,
    staff,
    sections: SECTIONS.map(({ id: sectionId, label }) => ({ id: sectionId, label })),
    tables: buildTables(tableCounts),
  }));
}

// Pick an index from cumulative weights by binary search.
function pickWeighted(rng, cumulative) {
  const target = rng() * cumulative[cumulative.length - 1];
  let low = 0;
  let high = cumulative.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (cumulative[mid] < target) low = mid + 1;
    else high = mid;
  }
  return low;
}

// Splits `total` across `weights` (largest-remainder), so the parts add up exactly.
function distribute(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / sum) * total);
  const parts = raw.map(Math.floor);
  let remainder = total - parts.reduce((a, b) => a + b, 0);
  const byFraction = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]);
  for (const [, index] of byFraction) {
    if (remainder <= 0) break;
    parts[index] += 1;
    remainder -= 1;
  }
  return parts;
}

function generateSales(location, recipesByItem) {
  const { profile } = location;
  const rng = createRng(`sales-${location.id}`);
  const menuById = Object.fromEntries(MENU.map((m) => [m.id, m]));

  let running = 0;
  const cumulative = MENU.map((m) => (running += POPULARITY[m.id] * (profile.popularity[m.id] ?? 1)));

  const days = [];
  const weeklyUse = Array.from({ length: WEEKS }, () => ({}));

  for (let i = 0; i < DAYS; i++) {
    const date = addDays(START_DATE, i);
    const dow = dayOfWeek(date);
    const drift = 1 + profile.trend * (i / (DAYS - 1));

    const covers = Math.max(
      40,
      Math.round(BASE_COVERS * profile.covers * DOW_COVERS[dow] * drift * normal(rng, 1, 0.06)),
    );
    const orders = Math.max(1, Math.round(covers / clamp(normal(rng, 2.6, 0.15), 2, 3.4)));
    const itemCount = Math.round(covers * profile.itemsPerCover * normal(rng, 1, 0.03));

    const itemsSold = {};
    for (let n = 0; n < itemCount; n++) {
      const menuItem = MENU[pickWeighted(rng, cumulative)];
      itemsSold[menuItem.id] = (itemsSold[menuItem.id] ?? 0) + 1;
    }

    let revenue = 0;
    const week = Math.floor(i / 7);
    for (const [menuItemId, quantity] of Object.entries(itemsSold)) {
      revenue += quantity * menuById[menuItemId].price;
      for (const [ingredientId, perPortion] of recipesByItem[menuItemId] ?? []) {
        weeklyUse[week][ingredientId] = (weeklyUse[week][ingredientId] ?? 0) + quantity * perPortion;
      }
    }

    const hourWeights = (dow === 0 || dow === 5 || dow === 6 ? WEEKEND_HOURS : WEEKDAY_HOURS).map(
      (w) => w * normal(rng, 1, 0.08),
    );
    const hourlyCovers = distribute(covers, hourWeights);

    const avgTicketMinutes = round(16 + profile.slowMinutes + DOW_TICKET_PENALTY[dow] + normal(rng, 0, 1.1), 1);

    days.push({ date, revenue, covers, orders, avgTicketMinutes, hourlyCovers, itemsSold });
  }

  // Per-dish prep: what the kitchen actually takes vs. what the menu promises.
  const itemPrep = {};
  for (const menuItem of MENU) {
    const slow = 1 + Math.max(0, profile.slowMinutes) * 0.04;
    const tandirPenalty = menuItem.id === "kuzu-tandir" ? 1.5 : 1;
    const avgMinutes = menuItem.prepMinutes * between(rng, 0.95, 1.1) * slow * tandirPenalty;
    itemPrep[menuItem.id] = {
      avgMinutes: round(avgMinutes, 1),
      p90Minutes: round(avgMinutes * between(rng, 1.25, 1.4), 1),
    };
  }

  // Whole-ticket time distribution, centred on this location's real average.
  const meanTicket = days.reduce((sum, d) => sum + d.avgTicketMinutes, 0) / days.length;
  const bucketEdges = [10, 15, 20, 25, 30];
  const bucketLabels = ["< 10 min", "10–15", "15–20", "20–25", "25–30", "30+"];
  const bucketCounts = bucketLabels.map(() => 0);
  for (let n = 0; n < 800; n++) {
    let minutes = normal(rng, meanTicket, 4.2);
    if (rng() < 0.08) minutes += between(rng, 6, 14); // the occasional stuck ticket
    const bucket = bucketEdges.findIndex((edge) => minutes < edge);
    bucketCounts[bucket === -1 ? bucketEdges.length : bucket] += 1;
  }
  const prepTimeDistribution = bucketLabels.map((label, i) => ({ label, count: bucketCounts[i] }));

  return { days, weeklyUse, itemPrep, prepTimeDistribution };
}

const niceRound = (value) => {
  if (value < 5) return Math.max(1, Math.round(value * 2) / 2);
  if (value < 20) return Math.round(value);
  return Math.round(value / 5) * 5;
};

// Par = about three days of average usage; reorder point = just under half of par.
function buildIngredients(salesByLocation) {
  return INGREDIENT_ROWS.map(([id, name, unit, costPerUnit]) => {
    let total = 0;
    let weeks = 0;
    for (const sales of Object.values(salesByLocation)) {
      for (const week of sales.weeklyUse) {
        total += week[id] ?? 0;
        weeks += 1;
      }
    }
    const parLevel = niceRound((total / weeks) * 0.4);
    return { id, name, unit, costPerUnit, parLevel, reorderPoint: round(parLevel * 0.45, 1) };
  });
}

// A few location-to-location transfers, planned up front so both sides agree.
function planTransfers(ingredients) {
  const rng = createRng("transfers");
  const plan = {};
  const pairs = [
    ["kadikoy", "uskudar"], ["nisantasi", "bebek"], ["besiktas", "bebek"], ["kadikoy", "besiktas"],
    ["nisantasi", "uskudar"], ["besiktas", "uskudar"],
  ];
  for (const [from, to] of pairs) {
    const ingredient = ingredients[Math.floor(rng() * ingredients.length)];
    const week = 3 + Math.floor(rng() * (WEEKS - 3));
    const quantity = round(ingredient.parLevel * 0.12, 1);
    plan[`${from}|${week}|${ingredient.id}`] = { out: quantity, to };
    plan[`${to}|${week}|${ingredient.id}`] = { in: quantity, from };
  }
  return plan;
}

function generateStock(location, sales, ingredients, transferPlan) {
  const rng = createRng(`stock-${location.id}`);
  const { profile, staff } = location;
  const counts = [];
  const movements = [];

  // Final-week levels: a few lines run low, and two locations have a genuine problem.
  const shuffled = [...ingredients];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const lowAtEnd = new Set(shuffled.slice(0, 3).map((i) => i.id));
  const criticalAtEnd = new Set();
  if (location.id === "bebek") criticalAtEnd.add("lamb");
  if (location.id === "uskudar") criticalAtEnd.add("sea-bass");

  const locationName = (id) => LOCATIONS.find((l) => l.id === id).name;

  for (const ingredient of ingredients) {
    let opening = round(ingredient.parLevel * between(rng, 0.9, 1.1), 1);

    for (let week = 0; week < WEEKS; week++) {
      const weekStart = addDays(START_DATE, week * 7);
      const weekEnd = addDays(weekStart, 6);
      const isLastWeek = week === WEEKS - 1;

      const theoretical = round(sales.weeklyUse[week][ingredient.id] ?? 0, 2);
      const spoilage = INGREDIENT_ROWS.find((row) => row[0] === ingredient.id)[4];
      const wasted = round(theoretical * spoilage * profile.waste * between(rng, 0.7, 1.3), 2);
      const staffMeal = round(
        theoretical * (STAFF_MEAL_SHARE[ingredient.id] ?? DEFAULT_STAFF_MEAL_SHARE) * between(rng, 0.8, 1.2),
        2,
      );
      const consumed = theoretical + wasted + staffMeal;

      let ratio = between(rng, 0.95, 1.3);
      if (isLastWeek && lowAtEnd.has(ingredient.id)) ratio = between(rng, 0.6, 0.85);
      if (isLastWeek && criticalAtEnd.has(ingredient.id)) ratio = between(rng, 0.3, 0.42);
      // Bebek's lamb supply tapers off over the last three weeks.
      if (location.id === "bebek" && ingredient.id === "lamb" && week >= WEEKS - 3) {
        ratio = [0.85, 0.65, 0.4][week - (WEEKS - 3)];
      }

      const transfer = transferPlan[`${location.id}|${week}|${ingredient.id}`] ?? {};
      const transferIn = transfer.in ?? 0;
      const transferOut = transfer.out ?? 0;

      const target = ingredient.parLevel * ratio;
      const received = round(Math.max(0, target - opening - transferIn + transferOut + consumed), 1);
      const trueClosing = Math.max(0, opening + received + transferIn - transferOut - consumed);
      const counted = round(Math.max(0, trueClosing + normal(rng, 0, 0.012 * Math.max(trueClosing, ingredient.parLevel * 0.2))), 1);

      const tuesdayShare = round(received * 0.6, 1);
      movements.push(
        { ingredientId: ingredient.id, quantity: tuesdayShare, reason: "received", timestamp: `${addDays(weekStart, 1)}T07:30:00` },
        { ingredientId: ingredient.id, quantity: round(received - tuesdayShare, 1), reason: "received", timestamp: `${addDays(weekStart, 4)}T07:30:00` },
        { ingredientId: ingredient.id, quantity: -theoretical, reason: "used", timestamp: `${weekEnd}T23:30:00` },
        { ingredientId: ingredient.id, quantity: -wasted, reason: "wasted", timestamp: `${weekEnd}T23:30:00` },
        { ingredientId: ingredient.id, quantity: -staffMeal, reason: "staff_meal", timestamp: `${weekEnd}T23:30:00` },
      );
      if (transferIn) {
        movements.push({ ingredientId: ingredient.id, quantity: transferIn, reason: "transferred", timestamp: `${addDays(weekStart, 2)}T15:00:00`, note: `From ${locationName(transfer.from)}` });
      }
      if (transferOut) {
        movements.push({ ingredientId: ingredient.id, quantity: -transferOut, reason: "transferred", timestamp: `${addDays(weekStart, 2)}T15:00:00`, note: `To ${locationName(transfer.to)}` });
      }

      counts.push({ ingredientId: ingredient.id, weekEnding: weekEnd, counted, countedBy: staff.storeManager });
      opening = counted; // the count is the record of what's on the shelf
    }
  }

  movements.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return { counts, movements };
}

function generateCleaning(location) {
  const rng = createRng(`cleaning-${location.id}`);
  const { profile } = location;
  const due = CLEANING_TASKS.length;
  const history = [];
  for (let i = 0; i < DAYS; i++) {
    const date = addDays(START_DATE, i);
    const dow = dayOfWeek(date);
    const weekendDip = dow === 0 || dow === 6 ? -0.03 : 0;
    const rate = clamp(profile.compliance + profile.complianceTrend * (i / (DAYS - 1)) + weekendDip + normal(rng, 0, 0.03), 0.3, 1);
    const completed = Math.round(due * rate);
    const onTimeRate = clamp(0.9 + normal(rng, 0, 0.04) - (profile.slowMinutes > 3 ? 0.12 : 0), 0.5, 1);
    history.push({ date, due, completed, onTime: Math.round(completed * onTimeRate) });
  }
  return history;
}

// ---------------------------------------------------------------------------
// Build everything and write it out
// ---------------------------------------------------------------------------

const recipeLines = Object.entries(RECIPES).flatMap(([menuItemId, lines]) =>
  lines.map(([ingredientId, quantity]) => ({ menuItemId, ingredientId, quantity })),
);

const salesByLocation = Object.fromEntries(LOCATIONS.map((l) => [l.id, generateSales(l, RECIPES)]));
const ingredients = buildIngredients(salesByLocation);
const transferPlan = planTransfers(ingredients);

const stockByLocation = {};
const cleaningByLocation = {};
for (const location of LOCATIONS) {
  stockByLocation[location.id] = generateStock(location, salesByLocation[location.id], ingredients, transferPlan);
  cleaningByLocation[location.id] = generateCleaning(location);
}

const endDate = addDays(START_DATE, DAYS - 1);

function writeJson(fileName, data, indent = 2) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, fileName), `${JSON.stringify(data, null, indent)}\n`);
}

writeJson("locations.json", buildLocations());
writeJson("menu.json", MENU);
writeJson("ingredients.json", ingredients);
writeJson("recipes.json", recipeLines);
writeJson("cleaning-tasks.json", CLEANING_TASKS);
writeJson(
  "sales-history.json",
  {
    startDate: START_DATE,
    endDate,
    serviceStartHour: SERVICE_START_HOUR,
    byLocation: Object.fromEntries(
      Object.entries(salesByLocation).map(([id, { days, itemPrep, prepTimeDistribution }]) => [id, { days, itemPrep, prepTimeDistribution }]),
    ),
  },
  0,
);
writeJson("stock-history.json", { startDate: START_DATE, endDate, byLocation: stockByLocation }, 0);
writeJson("cleaning-history.json", { startDate: START_DATE, endDate, byLocation: cleaningByLocation }, 0);

// ---------------------------------------------------------------------------
// Sanity report — read this after every run
// ---------------------------------------------------------------------------

const ingredientById = Object.fromEntries(ingredients.map((i) => [i.id, i]));
for (const line of recipeLines) {
  if (!ingredientById[line.ingredientId]) throw new Error(`Recipe uses unknown ingredient ${line.ingredientId}`);
  if (!MENU.some((m) => m.id === line.menuItemId)) throw new Error(`Recipe for unknown menu item ${line.menuItemId}`);
}

console.log(`Seed ${SEED}: ${START_DATE} → ${endDate}, ${MENU.length} menu items, ${ingredients.length} ingredients, ${recipeLines.length} recipe lines\n`);
console.log("location     avg revenue/day   covers/day   ticket min   cleaning   waste kg%");
for (const location of LOCATIONS) {
  const { days } = salesByLocation[location.id];
  const average = (pick) => days.reduce((sum, d) => sum + pick(d), 0) / days.length;
  const cleaning = cleaningByLocation[location.id];
  const compliance = cleaning.reduce((s, d) => s + d.completed, 0) / cleaning.reduce((s, d) => s + d.due, 0);
  const movements = stockByLocation[location.id].movements;
  const sumReason = (reason) => movements.filter((m) => m.reason === reason).reduce((s, m) => s - m.quantity, 0);
  console.log(
    `${location.id.padEnd(12)} ${Math.round(average((d) => d.revenue)).toString().padStart(15)}   ${Math.round(average((d) => d.covers)).toString().padStart(10)}   ${average((d) => d.avgTicketMinutes).toFixed(1).padStart(10)}   ${(compliance * 100).toFixed(0).padStart(7)}%   ${((sumReason("wasted") / sumReason("used")) * 100).toFixed(1).padStart(8)}%`,
  );
}

console.log("\nFinal counts below reorder point:");
for (const location of LOCATIONS) {
  for (const ingredient of ingredients) {
    const last = stockByLocation[location.id].counts.filter((c) => c.ingredientId === ingredient.id).at(-1);
    if (last.counted < ingredient.reorderPoint) {
      console.log(`  ${location.id}: ${ingredient.name} ${last.counted}${ingredient.unit} (reorder ${ingredient.reorderPoint}, par ${ingredient.parLevel})`);
    }
  }
}
const tandir = salesByLocation.kadikoy.itemPrep["kuzu-tandir"];
console.log(`\nSlow dish: Kuzu Tandır lists 20 min, averages ${tandir.avgMinutes} (p90 ${tandir.p90Minutes}) at Kadıköy`);
