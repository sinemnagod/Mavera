import { z } from 'zod';

export const URGENCIES = ['now', 'today', 'this_week'] as const;

// The shape of the GM's shift briefing. The model must fill exactly this in, and the
// screen draws it as cards. Every field is required, so the screen never has to guess.
export const briefingSchema = z.object({
  headline: z
    .string()
    .describe('One sentence: the single most important decision to make today, with the place and the number.'),
  actions: z
    .array(
      z.object({
        action: z.string().describe('A concrete instruction starting with a verb, naming the location.'),
        reason: z.string().describe('Why, with the actual numbers from the facts.'),
        urgency: z.enum(URGENCIES).describe('now = before service today, today = by tonight, this_week = soon'),
      }),
    )
    .min(1)
    .max(5)
    .describe('Between 3 and 5 decisions, most urgent first.'),
  watchItems: z
    .array(z.string())
    .max(4)
    .describe('Things that are not urgent yet but could become a problem. May be empty.'),
  comparison: z
    .string()
    .describe('One or two sentences comparing the best and the weakest location.'),
});

export type Briefing = z.infer<typeof briefingSchema>;
