import { db } from "./db";
import {
  levels,
  scores,
  type Level,
  type InsertLevel,
  type Score,
  type InsertScore,
  type LevelData
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getLevels(): Promise<Level[]>;
  getLevel(id: number): Promise<Level | undefined>;
  getScores(levelId: number): Promise<Score[]>;
  createScore(score: InsertScore): Promise<Score>;
  seedLevels(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getLevels(): Promise<Level[]> {
    return await db.select().from(levels).orderBy(levels.order);
  }

  async getLevel(id: number): Promise<Level | undefined> {
    const [level] = await db.select().from(levels).where(eq(levels.id, id));
    return level;
  }

  async getScores(levelId: number): Promise<Score[]> {
    return await db
      .select()
      .from(scores)
      .where(eq(scores.levelId, levelId))
      .orderBy(scores.timeSeconds)
      .limit(10);
  }

  async createScore(score: InsertScore): Promise<Score> {
    const [newScore] = await db.insert(scores).values(score).returning();
    return newScore;
  }

  async seedLevels(): Promise<void> {
    const existing = await db.select().from(levels);
    if (existing.length > 0) return;

    const allLevels = [
      {
        name: "Level 1: The Awakening",
        order: 1,
        data: {
          width: 800, height: 600, spawn: { x: 50, y: 500 }, exit: { x: 700, y: 500 },
          platforms: [
            { x: 0, y: 550, w: 800, h: 50, type: 'static' },
            { x: 0, y: 0, w: 50, h: 600, type: 'static' },
            { x: 750, y: 0, w: 50, h: 600, type: 'static' },
            { x: 300, y: 400, w: 200, h: 20, type: 'static' },
          ],
          buttons: [], doors: [],
          lightZones: [{ x: 300, y: 300, w: 200, h: 100 }]
        }
      },
      {
        name: "Level 2: The Mechanism",
        order: 2,
        data: {
          width: 800, height: 600, spawn: { x: 50, y: 500 }, exit: { x: 700, y: 100 },
          platforms: [
            { x: 0, y: 550, w: 800, h: 50, type: 'static' },
            { x: 0, y: 0, w: 50, h: 600, type: 'static' },
            { x: 750, y: 0, w: 50, h: 600, type: 'static' },
            { x: 200, y: 450, w: 100, h: 20, type: 'static' },
            { x: 400, y: 350, w: 100, h: 20, type: 'static' },
            { x: 600, y: 250, w: 150, h: 20, type: 'static' },
          ],
          buttons: [{ x: 650, y: 230, w: 40, h: 20, id: 'btn1', targetId: 'door1' }],
          doors: [{ x: 700, y: 100, w: 40, h: 60, id: 'door1', isOpen: false }],
          lightZones: []
        }
      },
      {
        name: "Level 3: Disappearing Acts",
        order: 3,
        data: {
          width: 800, height: 600, spawn: { x: 50, y: 500 }, exit: { x: 700, y: 450 },
          platforms: [
            { x: 0, y: 550, w: 200, h: 50, type: 'static' },
            { x: 250, y: 500, w: 100, h: 20, type: 'disappearing' },
            { x: 400, y: 450, w: 100, h: 20, type: 'disappearing' },
            { x: 550, y: 500, w: 100, h: 20, type: 'disappearing' },
            { x: 650, y: 550, w: 150, h: 50, type: 'static' },
          ],
          buttons: [], doors: [], lightZones: [{ x: 380, y: 380, w: 140, h: 100 }]
        }
      },
      {
        name: "Level 4: Split Path",
        order: 4,
        data: {
          width: 800, height: 600, spawn: { x: 50, y: 500 }, exit: { x: 700, y: 300 },
          platforms: [
            { x: 0, y: 550, w: 200, h: 50, type: 'static' },
            { x: 230, y: 400, w: 200, h: 20, type: 'moving', startY: 400, range: 100, speed: 2 }, // Elevator
            { x: 500, y: 400, w: 100, h: 20, type: 'static' }, // Added platform to bridge gap
            { x: 650, y: 400, w: 150, h: 20, type: 'static' },
            { x: 0, y: 250, w: 150, h: 20, type: 'static' },
            { x: 300, y: 150, w: 200, h: 20, type: 'static' },
          ],
          buttons: [{ x: 50, y: 230, w: 40, h: 20, id: 'b1', targetId: 'd1' }],
          doors: [{ x: 650, y: 340, w: 40, h: 60, id: 'd1', isOpen: false }],
          lightZones: [{ x: 300, y: 100, w: 200, h: 100 }]
        }
      },
      {
        name: "Level 5: The Descent",
        order: 5,
        data: {
          width: 800, height: 600, spawn: { x: 400, y: 50 }, exit: { x: 400, y: 520 },
          platforms: [
            { x: 350, y: 100, w: 100, h: 20, type: 'static' },
            { x: 100, y: 200, w: 150, h: 20, type: 'disappearing' },
            { x: 550, y: 200, w: 150, h: 20, type: 'disappearing' },
            { x: 350, y: 300, w: 100, h: 20, type: 'disappearing' },
            { x: 100, y: 400, w: 150, h: 20, type: 'static' },
            { x: 550, y: 400, w: 150, h: 20, type: 'static' },
            { x: 300, y: 550, w: 200, h: 50, type: 'static' },
          ],
          buttons: [{ x: 150, y: 380, w: 40, h: 20, id: 'b5', targetId: 'd5' }],
          doors: [{ x: 380, y: 490, w: 40, h: 60, id: 'd5', isOpen: false }],
          lightZones: []
        }
      },
      {
        name: "Level 6: Reflection",
        order: 6,
        data: {
          width: 800, height: 600, spawn: { x: 50, y: 500 }, exit: { x: 50, y: 100 },
          platforms: [
            { x: 0, y: 550, w: 800, h: 50, type: 'static' },
            { x: 600, y: 450, w: 200, h: 20, type: 'static' },
            { x: 400, y: 350, w: 200, h: 20, type: 'static' },
            { x: 200, y: 250, w: 200, h: 20, type: 'static' },
            { x: 0, y: 150, w: 150, h: 20, type: 'static' },
          ],
          buttons: [
            { x: 700, y: 430, w: 40, h: 20, id: 'b6a', targetId: 'd6a' },
            { x: 500, y: 330, w: 40, h: 20, id: 'b6b', targetId: 'd6b' }
          ],
          doors: [
            { x: 250, y: 200, w: 40, h: 60, id: 'd6a', isOpen: false },
            { x: 50, y: 100, w: 40, h: 60, id: 'd6b', isOpen: false }
          ],
          lightZones: [{ x: 400, y: 300, w: 200, h: 100 }]
        }
      },
      {
        name: "Level 7: Precision",
        order: 7,
        data: {
          width: 800, height: 600, spawn: { x: 50, y: 500 }, exit: { x: 700, y: 100 },
          platforms: [
            { x: 0, y: 550, w: 100, h: 50, type: 'static' },
            { x: 150, y: 450, w: 50, h: 20, type: 'static' },
            { x: 250, y: 350, w: 50, h: 20, type: 'static' },
            { x: 350, y: 250, w: 50, h: 20, type: 'static' },
            { x: 450, y: 150, w: 50, h: 20, type: 'static' },
            { x: 600, y: 150, w: 200, h: 50, type: 'static' },
          ],
          buttons: [], doors: [],
          lightZones: [{ x: 340, y: 200, w: 70, h: 100 }]
        }
      },
      {
        name: "Level 8: The Gauntlet",
        order: 8,
        data: {
          width: 800, height: 600, spawn: { x: 50, y: 500 }, exit: { x: 700, y: 500 },
          platforms: [
            { x: 0, y: 550, w: 150, h: 50, type: 'static' },
            { x: 200, y: 550, w: 100, h: 50, type: 'disappearing' },
            { x: 350, y: 550, w: 100, h: 50, type: 'disappearing' }, // Middle disappearing
            { x: 500, y: 550, w: 100, h: 50, type: 'disappearing' },
            { x: 650, y: 550, w: 150, h: 50, type: 'static' },
            { x: 300, y: 450, w: 200, h: 20, type: 'static' }, // Restored static platform
          ],
          buttons: [{ x: 380, y: 470, w: 40, h: 20, id: 'b8', targetId: 'd8' }], // Inverted button (y: 450 + 20)
          doors: [{ x: 700, y: 500, w: 40, h: 60, id: 'd8', isOpen: false }],
          lightZones: []
        }
      },
      {
        name: "Level 9: Chaos",
        order: 9,
        data: {
          width: 800, height: 600, spawn: { x: 50, y: 100 }, exit: { x: 700, y: 500 },
          platforms: [
            { x: 0, y: 150, w: 150, h: 20, type: 'static' },
            { x: 200, y: 250, w: 100, h: 20, type: 'disappearing' },
            { x: 400, y: 350, w: 100, h: 20, type: 'disappearing' },
            { x: 600, y: 450, w: 100, h: 20, type: 'disappearing' },
            { x: 650, y: 550, w: 150, h: 50, type: 'static' },
          ],
          buttons: [], doors: [], lightZones: []
        }
      },
      {
        name: "Level 10: Final Escape",
        order: 10,
        data: {
          width: 800, height: 600, spawn: { x: 50, y: 500 }, exit: { x: 700, y: 50 },
          platforms: [
            { x: 0, y: 550, w: 100, h: 50, type: 'static' },
            { x: 200, y: 450, w: 100, h: 20, type: 'disappearing' },
            { x: 400, y: 350, w: 100, h: 20, type: 'disappearing' },
            { x: 600, y: 250, w: 100, h: 20, type: 'disappearing' },
            { x: 400, y: 150, w: 100, h: 20, type: 'static' },
            { x: 650, y: 100, w: 150, h: 20, type: 'static' },
          ],
          buttons: [{ x: 430, y: 130, w: 40, h: 20, id: 'bf', targetId: 'df' }],
          doors: [{ x: 750, y: 50, w: 40, h: 60, id: 'df', isOpen: false }],
          lightZones: [{ x: 100, y: 100, w: 100, h: 100 }]
        }
      }
    ];

    await db.insert(levels).values(allLevels);
  }
}

export const storage = new DatabaseStorage();
