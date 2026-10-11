import type { Briefing } from './briefing.schema.js';

// Just the part of the GM overview that the briefing needs.
export interface BriefingFacts {
  period: { from: string; to: string } | null;
  locations: {
    name: string;
    revenue: number;
    revenueChangePct: number;
    wastePct: number;
    cleaningCompliance: number;
    avgTicketMinutes: number;
    lowStock: { name: string; counted: number; unit: string; reorderPoint: number }[];
    slowDishes: { name: string; listedMinutes: number; avgMinutes: number }[];
  }[];
}

const RANK = { now: 0, today: 1, this_week: 2 } as const;
const tl = (n: number) => `${Math.round(n).toLocaleString('en-US')} TL`;

// A plain, rule-based briefing built from the same facts. It is only used for the
// development demo (AI_MOCK=1), so the screen can be tried without calling a model.
export function ruleBasedBriefing(facts: BriefingFacts): Briefing {
  const places = facts.locations;
  const avg = (pick: (l: (typeof places)[number]) => number) =>
    places.reduce((sum, l) => sum + pick(l), 0) / (places.length || 1);
  const avgWaste = avg((l) => l.wastePct);
  const avgCleaning = avg((l) => l.cleaningCompliance);

  const actions: Briefing['actions'] = [];
  for (const place of places) {
    for (const item of place.lowStock) {
      actions.push({
        action: `Order ${item.name.toLowerCase()} for ${place.name} before the next service`,
        reason: `${item.counted}${item.unit} left, below the reorder point of ${item.reorderPoint}${item.unit}. Dishes that use it will run out.`,
        urgency: 'now',
      });
    }
  }
  for (const place of places) {
    for (const dish of place.slowDishes) {
      actions.push({
        action: `Fix the prep of ${dish.name} at ${place.name}`,
        reason: `The menu says ${dish.listedMinutes} min but it averages ${dish.avgMinutes} min, which holds up whole tables.`,
        urgency: 'today',
      });
    }
  }
  const worstCleaning = [...places].sort((a, b) => a.cleaningCompliance - b.cleaningCompliance)[0];
  if (worstCleaning && worstCleaning.cleaningCompliance < 75) {
    actions.push({
      action: `Visit ${worstCleaning.name} this week and reset the cleaning routine`,
      reason: `Only ${worstCleaning.cleaningCompliance}% of cleaning tasks were done, against a group average of ${Math.round(avgCleaning)}%.`,
      urgency: 'today',
    });
  }
  const worstWaste = [...places].sort((a, b) => b.wastePct - a.wastePct)[0];
  if (worstWaste && worstWaste.wastePct > avgWaste * 1.5) {
    actions.push({
      action: `Review portioning and spoilage at ${worstWaste.name}`,
      reason: `Waste is ${worstWaste.wastePct}% of stock value, against a group average of ${avgWaste.toFixed(1)}%.`,
      urgency: 'this_week',
    });
  }
  const falling = [...places].sort((a, b) => a.revenueChangePct - b.revenueChangePct)[0];
  if (falling && falling.revenueChangePct < -5) {
    actions.push({
      action: `Find out why sales are falling at ${falling.name}`,
      reason: `Revenue is down ${Math.abs(falling.revenueChangePct)}% on last week.`,
      urgency: 'this_week',
    });
  }

  const top = actions.sort((a, b) => RANK[a.urgency] - RANK[b.urgency]).slice(0, 5);
  const byRevenue = [...places].sort((a, b) => b.revenue - a.revenue);
  const best = byRevenue[0];
  const weakest = byRevenue[byRevenue.length - 1];

  return {
    headline: top[0] ? `${top[0].action}.` : 'Nothing needs a decision today.',
    actions: top.length
      ? top
      : [{ action: 'Keep service as it is', reason: 'No location is below its targets this week.', urgency: 'this_week' }],
    watchItems: places
      .filter((p) => p.avgTicketMinutes > 20)
      .map((p) => `${p.name}: tickets average ${p.avgTicketMinutes} minutes`)
      .slice(0, 4),
    comparison:
      best && weakest
        ? `${best.name} leads with ${tl(best.revenue)} this week. ${weakest.name} trails with ${tl(weakest.revenue)}, ${weakest.cleaningCompliance}% cleaning compliance and ${weakest.wastePct}% waste.`
        : 'No sales data yet.',
  };
}
