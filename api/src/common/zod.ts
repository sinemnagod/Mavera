import { BadRequestException } from '@nestjs/common';
import type { z } from 'zod';

// Checks incoming data against a schema. A bad request gets a clear 400 message.
export function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
      .join('; ');
    throw new BadRequestException(message);
  }
  return result.data;
}
