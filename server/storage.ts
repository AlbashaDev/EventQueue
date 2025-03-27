import { 
  type User, 
  type InsertUser, 
  type QueueItem, 
  type InsertQueueItem, 
  type QueueSettings,
  type QueueStatus,
  users,
  queueItems,
  queueSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Queue item operations
  getQueueItem(number: number): Promise<QueueItem | undefined>;
  getQueueItems(): Promise<QueueItem[]>;
  getQueueItemsByStatus(status: string): Promise<QueueItem[]>;
  createQueueItem(item: InsertQueueItem): Promise<QueueItem>;
  updateQueueItemStatus(number: number, status: string): Promise<QueueItem | undefined>;
  deleteQueueItem(number: number): Promise<boolean>;
  
  // Queue operations
  getCurrentNumber(): Promise<number>;
  setCurrentNumber(number: number): Promise<void>;
  getLastNumber(): Promise<number>;
  incrementLastNumber(): Promise<number>;
  resetQueue(): Promise<void>;
  
  // Queue settings
  getSoundEnabled(): Promise<boolean>;
  setSoundEnabled(enabled: boolean): Promise<void>;
  getVisualAlertsEnabled(): Promise<boolean>;
  setVisualAlertsEnabled(enabled: boolean): Promise<void>;
  
  // Queue status
  getQueueStatus(): Promise<QueueStatus>;
}

export class DatabaseStorage implements IStorage {
  private lastCalledAt: Date | null = null;

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  async listUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.username);
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }
  
  // Queue item operations
  async getQueueItem(number: number): Promise<QueueItem | undefined> {
    const result = await db.select().from(queueItems).where(eq(queueItems.number, number));
    return result[0];
  }
  
  async getQueueItems(): Promise<QueueItem[]> {
    return db.select().from(queueItems).orderBy(asc(queueItems.number));
  }
  
  async getQueueItemsByStatus(status: string): Promise<QueueItem[]> {
    return db.select().from(queueItems)
      .where(eq(queueItems.status, status))
      .orderBy(asc(queueItems.number));
  }
  
  async createQueueItem(item: Partial<InsertQueueItem>): Promise<QueueItem> {
    const number = item.number || await this.incrementLastNumber();
    
    const result = await db.insert(queueItems).values({
      number,
      status: item.status || "waiting",
      userId: null,
    }).returning();
    
    return result[0];
  }
  
  async updateQueueItemStatus(number: number, status: string): Promise<QueueItem | undefined> {
    const result = await db.update(queueItems)
      .set({ status })
      .where(eq(queueItems.number, number))
      .returning();
    
    return result[0];
  }
  
  async deleteQueueItem(number: number): Promise<boolean> {
    await db.delete(queueItems).where(eq(queueItems.number, number));
    return true;
  }
  
  // Queue operations
  async getCurrentNumber(): Promise<number> {
    const settings = await this.getOrCreateSettings();
    return settings.currentNumber;
  }
  
  async setCurrentNumber(number: number): Promise<void> {
    this.lastCalledAt = new Date();
    
    await db.update(queueSettings)
      .set({ currentNumber: number })
      .where(eq(queueSettings.id, 1));
    
    // Update the status of the current number if > 0
    if (number > 0) {
      await this.updateQueueItemStatus(number, "serving");
    }
  }
  
  async getLastNumber(): Promise<number> {
    const settings = await this.getOrCreateSettings();
    return settings.lastNumber;
  }
  
  async incrementLastNumber(): Promise<number> {
    const settings = await this.getOrCreateSettings();
    const newLastNumber = settings.lastNumber + 1;
    
    await db.update(queueSettings)
      .set({ lastNumber: newLastNumber })
      .where(eq(queueSettings.id, 1));
    
    return newLastNumber;
  }
  
  async resetQueue(): Promise<void> {
    this.lastCalledAt = null;
    
    // Reset queue settings
    await db.update(queueSettings)
      .set({ 
        currentNumber: 0, 
        lastNumber: 0,
        resetDate: new Date()
      })
      .where(eq(queueSettings.id, 1));
    
    // Delete all queue items
    await db.delete(queueItems);
  }
  
  // Queue settings
  async getSoundEnabled(): Promise<boolean> {
    const settings = await this.getOrCreateSettings();
    return settings.soundEnabled;
  }
  
  async setSoundEnabled(enabled: boolean): Promise<void> {
    await db.update(queueSettings)
      .set({ soundEnabled: enabled })
      .where(eq(queueSettings.id, 1));
  }
  
  async getVisualAlertsEnabled(): Promise<boolean> {
    const settings = await this.getOrCreateSettings();
    return settings.visualAlertsEnabled;
  }
  
  async setVisualAlertsEnabled(enabled: boolean): Promise<void> {
    await db.update(queueSettings)
      .set({ visualAlertsEnabled: enabled })
      .where(eq(queueSettings.id, 1));
  }
  
  // Helper to get or create settings
  private async getOrCreateSettings(): Promise<QueueSettings> {
    const existingSettings = await db.select().from(queueSettings);
    
    if (existingSettings.length === 0) {
      const newSettings = await db.insert(queueSettings)
        .values({
          id: 1,
          currentNumber: 0,
          lastNumber: 0,
          soundEnabled: true,
          visualAlertsEnabled: true,
          resetDate: new Date(),
        })
        .returning();
      
      return newSettings[0];
    }
    
    return existingSettings[0];
  }
  
  // Queue status
  async getQueueStatus(): Promise<QueueStatus> {
    const currentNumber = await this.getCurrentNumber();
    const waitingItems = await this.getQueueItemsByStatus("waiting");
    const nextNumbers = waitingItems.map(item => item.number);
    const allItems = await this.getQueueItems();
    
    return {
      currentNumber,
      nextNumbers,
      waitingCount: waitingItems.length,
      queueItems: allItems.map(item => ({
        number: item.number,
        status: item.status,
        issuedAt: item.issuedAt.toLocaleTimeString('sv-SE', { 
          hour: 'numeric', 
          minute: '2-digit',
        }),
      })),
      lastCalledAt: this.lastCalledAt ? 
        this.lastCalledAt.toLocaleTimeString('sv-SE', { 
          hour: 'numeric', 
          minute: '2-digit',
        }) : undefined,
    };
  }
}

export const storage = new DatabaseStorage();
