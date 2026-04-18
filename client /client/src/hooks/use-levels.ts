import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Helper to safely parse API responses
function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useLevels() {
  return useQuery({
    queryKey: [api.levels.list.path],
    queryFn: async () => {
      const res = await fetch(api.levels.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch levels");
      const data = await res.json();
      return parseWithLogging(api.levels.list.responses[200], data, "levels.list");
    },
  });
}

export function useLevel(id: number) {
  return useQuery({
    queryKey: [api.levels.get.path, id],
    queryFn: async () => {
      // Handle the case where id is undefined or NaN gracefully if needed, though react-query enabled option usually handles this
      if (!id) return null;
      
      const url = buildUrl(api.levels.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch level");
      
      const data = await res.json();
      return parseWithLogging(api.levels.get.responses[200], data, "levels.get");
    },
    enabled: !!id,
  });
}
