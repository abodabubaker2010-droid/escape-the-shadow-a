import { pgTable, text, serial, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Store level layouts (platforms, objects, spawn points)
export const levels = pgTable("levels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  // JSON structure: { 
  //   width: number, height: number, 
  //   spawn: {x, y}, exit: {x, y}, 
  //   platforms: Array<{x, y, w, h, type: 'static'|'disappearing'}>,
  //   buttons: Array<{x, y, w, h, id, targetId}>,
  //   doors: Array<{x, y, w, h, id, isOpen}>,
  //   lightZones: Array<{x, y, w, h}>
  // }
  data: jsonb("data").notNull(),
  order: integer("order").notNull(),
});

// Simple high scores
export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  levelId: integer("level_id").notNull(),
  playerName: text("player_name").notNull(),
  timeSeconds: integer("time_seconds").notNull(), // Lower is better
});

// === SCHEMAS ===

export const insertLevelSchema = createInsertSchema(levels);
export const insertScoreSchema = createInsertSchema(scores);

// === API TYPES ===

export type Level = typeof levels.$inferSelect;
export type InsertLevel = z.infer<typeof insertLevelSchema>;
export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;

export interface LevelData {
  width: number;
  height: number;
  spawn: { x: number; y: number };
  exit: { x: number; y: number };
  platforms: Array<{ 
    x: number; 
    y: number; 
    w: number; 
    h: number; 
    type: 'static' | 'disappearing' | 'moving';
    startY?: number;
    range?: number;
    speed?: number;
  }>;
  buttons: Array<{ x: number; y: number; w: number; h: number; id: string; targetId: string }>;
  doors: Array<{ x: number; y: number; w: number; h: number; id: string; isOpen?: boolean }>;
  lightZones: Array<{ x: number; y: number; w: number; h: number }>;
}
