import { HttpException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  createUIMessageStream,
  isStepCount,
  pipeUIMessageStreamToResponse,
  streamText,
  tool,
  toUIMessageStream,
} from 'ai';
import type { ServerResponse } from 'node:http';
import type { AuthUser } from '../common/auth-user.js';
import { GmService } from '../gm/gm.service.js';
import { briefingSchema } from './briefing.schema.js';
import { type BriefingFacts, ruleBasedBriefing } from './briefing.rules.js';

const INSTRUCTIONS = `You are the operations advisor for Mavera, a five-restaurant group in Istanbul.
You write the general manager's briefing for today.
Rules:
- Output decisions, not a summary. Each action says what to DO, where, and why, using the real numbers from the facts.
- Never restate the dashboard. Do not invent numbers or locations that are not in the facts.
- Order actions by urgency: now, today, this_week. Give 3 to 5 actions.
- Connect a shortage to the dishes it affects when the facts allow it.
- Use plain, short sentences.
Always respond by calling the shiftBriefing tool exactly once.`;

const LIMIT = 8;
const WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

@Injectable()
export class AiService {
  // Remembers when each user last asked, so one account cannot burn through the AI quota.
  private readonly recent = new Map<string, number[]>();

  constructor(private readonly gm: GmService) {}

  async briefing(user: AuthUser, response: ServerResponse, signal: AbortSignal) {
    this.enforceLimit(user.id);
    const overview = await this.gm.overview();
    const facts: BriefingFacts = overview;

    if (process.env.AI_MOCK === '1') return this.demo(facts, response);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new ServiceUnavailableException('The AI is not set up yet (no API key on the server).');

    const provider = createOpenAICompatible({
      name: 'openrouter',
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
    });

    const result = streamText({
      model: provider.chatModel(process.env.AI_MODEL ?? DEFAULT_MODEL),
      instructions: INSTRUCTIONS,
      messages: [
        {
          role: 'user',
          content: `Facts for the week ${facts.period?.from} to ${facts.period?.to}:\n${JSON.stringify(facts)}\n\nGive me today's shift briefing.`,
        },
      ],
      tools: {
        shiftBriefing: tool({
          description: "Deliver the general manager's shift briefing as structured data.",
          inputSchema: briefingSchema,
          // The briefing is the tool's input; "executing" it simply hands it to the screen.
          execute: async (input) => input,
        }),
      },
      toolChoice: 'required',
      stopWhen: isStepCount(1),
      maxOutputTokens: 1500,
      abortSignal: AbortSignal.any([signal, AbortSignal.timeout(60_000)]),
    });

    await pipeUIMessageStreamToResponse({
      response,
      stream: toUIMessageStream({
        stream: result.stream,
        // Never send raw provider errors (they can contain details) to the browser.
        onError: () => 'The AI could not produce a briefing right now.',
      }),
    });
  }

  // Development demo: the same stream a model would produce, built from the facts by rules.
  private async demo(facts: BriefingFacts, response: ServerResponse) {
    const briefing = ruleBasedBriefing(facts);
    const toolCallId = 'demo-briefing';
    const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        writer.write({ type: 'start' });
        writer.write({ type: 'start-step' });
        writer.write({ type: 'tool-input-start', toolCallId, toolName: 'shiftBriefing' });
        const text = JSON.stringify(briefing);
        for (let i = 0; i < text.length; i += 160) {
          writer.write({ type: 'tool-input-delta', toolCallId, inputTextDelta: text.slice(i, i + 160) });
          await pause(120);
        }
        writer.write({ type: 'tool-input-available', toolCallId, toolName: 'shiftBriefing', input: briefing });
        await pause(400);
        writer.write({ type: 'tool-output-available', toolCallId, output: briefing });
        writer.write({ type: 'finish-step' });
        writer.write({ type: 'finish' });
      },
    });
    await pipeUIMessageStreamToResponse({ response, stream });
  }

  private enforceLimit(userId: string) {
    const now = Date.now();
    const times = (this.recent.get(userId) ?? []).filter((t) => now - t < WINDOW_MS);
    if (times.length >= LIMIT) {
      throw new HttpException('You have asked for a lot of briefings. Try again in a few minutes.', 429);
    }
    this.recent.set(userId, [...times, now]);
  }
}
