import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertScore } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useScores(levelId: number) {
  return useQuery({
    queryKey: [api.scores.list.path, levelId],
    queryFn: async () => {
      if (!levelId) return [];
      const url = buildUrl(api.scores.list.path, { levelId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch scores");
      const data = await res.json();
      return parseWithLogging(api.scores.list.responses[200], data, "scores.list");
    },
    enabled: !!levelId,
  });
}

export function useCreateScore() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (scoreData: InsertScore) => {
      const validated = api.scores.create.input.parse(scoreData);
      
      const res = await fetch(api.scores.create.path, {
        method: api.scores.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.scores.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to save score");
      }

      return api.scores.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate the scores list for the level we just played
      queryClient.invalidateQueries({ 
        queryKey: [api.scores.list.path, variables.levelId] 
      });
    },
  });
}
