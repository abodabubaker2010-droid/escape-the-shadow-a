import { z } from 'zod';
import { insertScoreSchema, levels, scores, type InsertScore } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  levels: {
    list: {
      method: 'GET' as const,
      path: '/api/levels',
      responses: {
        200: z.array(z.custom<typeof levels.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/levels/:id',
      responses: {
        200: z.custom<typeof levels.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  scores: {
    list: {
      method: 'GET' as const,
      path: '/api/scores/:levelId',
      responses: {
        200: z.array(z.custom<typeof scores.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/scores',
      input: insertScoreSchema,
      responses: {
        201: z.custom<typeof scores.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type LevelResponse = z.infer<typeof api.levels.get.responses[200]>;
export type { InsertScore };
