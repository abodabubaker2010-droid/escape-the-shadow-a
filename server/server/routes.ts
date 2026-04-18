import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed database with levels on startup
  await storage.seedLevels();

  app.get(api.levels.list.path, async (req, res) => {
    const levels = await storage.getLevels();
    res.json(levels);
  });

  app.get(api.levels.get.path, async (req, res) => {
    const level = await storage.getLevel(Number(req.params.id));
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }
    res.json(level);
  });

  app.get(api.scores.list.path, async (req, res) => {
    const scores = await storage.getScores(Number(req.params.levelId));
    res.json(scores);
  });

  app.post(api.scores.create.path, async (req, res) => {
    try {
      const input = api.scores.create.input.parse(req.body);
      const score = await storage.createScore(input);
      res.status(201).json(score);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
