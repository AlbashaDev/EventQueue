import { 
  type User, 
  type InsertUser, 
  type QueueItem, 
  type InsertQueueItem, 
  type QueueSettings,
  type QueueStatus 
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations (kept for compatibility)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private queueItems: Map<number, QueueItem>;
  private currentNumber: number;
  private lastNumber: number;
  private lastCalledAt: Date | null;
  private soundEnabled: boolean;
  private visualAlertsEnabled: boolean;
  private userId: number;

  constructor() {
    this.users = new Map();
    this.queueItems = new Map();
    this.currentNumber = 0;
    this.lastNumber = 0;
    this.lastCalledAt = null;
    this.soundEnabled = true;
    this.visualAlertsEnabled = true;
    this.userId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Queue item operations
  async getQueueItem(number: number): Promise<QueueItem | undefined> {
    return this.queueItems.get(number);
  }
  
  async getQueueItems(): Promise<QueueItem[]> {
    return Array.from(this.queueItems.values())
      .sort((a, b) => a.number - b.number);
  }
  
  async getQueueItemsByStatus(status: string): Promise<QueueItem[]> {
    return Array.from(this.queueItems.values())
      .filter(item => item.status === status)
      .sort((a, b) => a.number - b.number);
  }
  
  async createQueueItem(item: Partial<InsertQueueItem>): Promise<QueueItem> {
    const number = item.number || await this.incrementLastNumber();
    const now = new Date();
    
    const queueItem: QueueItem = {
      id: number, // Use number as ID for simplicity
      number,
      status: item.status || "waiting",
      issuedAt: now,
    };
    
    this.queueItems.set(number, queueItem);
    return queueItem;
  }
  
  async updateQueueItemStatus(number: number, status: string): Promise<QueueItem | undefined> {
    const item = this.queueItems.get(number);
    if (!item) return undefined;
    
    const updatedItem: QueueItem = {
      ...item,
      status,
    };
    
    this.queueItems.set(number, updatedItem);
    return updatedItem;
  }
  
  async deleteQueueItem(number: number): Promise<boolean> {
    return this.queueItems.delete(number);
  }
  
  // Queue operations
  async getCurrentNumber(): Promise<number> {
    return this.currentNumber;
  }
  
  async setCurrentNumber(number: number): Promise<void> {
    this.currentNumber = number;
    this.lastCalledAt = new Date();
    
    // Update the status of the current number
    if (number > 0) {
      await this.updateQueueItemStatus(number, "serving");
    }
  }
  
  async getLastNumber(): Promise<number> {
    return this.lastNumber;
  }
  
  async incrementLastNumber(): Promise<number> {
    this.lastNumber += 1;
    return this.lastNumber;
  }
  
  async resetQueue(): Promise<void> {
    this.currentNumber = 0;
    this.lastNumber = 0;
    this.lastCalledAt = null;
    this.queueItems.clear();
  }
  
  // Queue settings
  async getSoundEnabled(): Promise<boolean> {
    return this.soundEnabled;
  }
  
  async setSoundEnabled(enabled: boolean): Promise<void> {
    this.soundEnabled = enabled;
  }
  
  async getVisualAlertsEnabled(): Promise<boolean> {
    return this.visualAlertsEnabled;
  }
  
  async setVisualAlertsEnabled(enabled: boolean): Promise<void> {
    this.visualAlertsEnabled = enabled;
  }
  
  // Queue status
  async getQueueStatus(): Promise<QueueStatus> {
    const waitingItems = await this.getQueueItemsByStatus("waiting");
    const nextNumbers = waitingItems.map(item => item.number);
    
    return {
      currentNumber: this.currentNumber,
      nextNumbers,
      waitingCount: waitingItems.length,
      queueItems: Array.from(this.queueItems.values()).map(item => ({
        number: item.number,
        status: item.status,
        issuedAt: item.issuedAt.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
      })),
      lastCalledAt: this.lastCalledAt ? 
        this.lastCalledAt.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }) : undefined,
    };
  }
}

export const storage = new MemStorage();
