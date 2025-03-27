import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import WebSocket, { WebSocketServer } from "ws";
import { log } from "./vite";

// WebSocket clients
let wsClients: WebSocket[] = [];

// Broadcast function to send updates to all connected clients
function broadcastQueueUpdate() {
  storage.getQueueStatus().then(status => {
    const message = JSON.stringify({
      type: "QUEUE_UPDATE",
      data: status
    });
    
    log(`Broadcasting queue update to ${wsClients.length} clients`, "websocket");
    
    wsClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/ws" // Set a specific path for WebSocket connections
  });
  
  log("WebSocket server initialized", "websocket");
  
  wss.on("connection", (ws, req) => {
    log(`New WebSocket connection from ${req.socket.remoteAddress}`, "websocket");
    
    // Add new client to list
    wsClients.push(ws);
    log(`Total connected clients: ${wsClients.length}`, "websocket");
    
    // Send initial queue status
    storage.getQueueStatus().then(status => {
      const initialData = JSON.stringify({
        type: "QUEUE_UPDATE",
        data: status
      });
      
      ws.send(initialData);
      log("Initial queue status sent to new client", "websocket");
    }).catch(err => {
      log(`Error sending initial status: ${err.message}`, "websocket");
    });
    
    // Handle messages from client
    ws.on("message", (message) => {
      log(`Received message from client: ${message}`, "websocket");
    });
    
    // Handle errors
    ws.on("error", (error) => {
      log(`WebSocket error: ${error.message}`, "websocket");
    });
    
    // Remove client on disconnect
    ws.on("close", (code, reason) => {
      wsClients = wsClients.filter(client => client !== ws);
      log(`WebSocket disconnected. Code: ${code}, Reason: ${reason || 'No reason provided'}. Remaining clients: ${wsClients.length}`, "websocket");
    });
  });
  
  // Get queue status
  app.get("/api/queue/status", async (req, res) => {
    try {
      const status = await storage.getQueueStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get queue status" });
    }
  });
  
  // Add new number to the queue
  app.post("/api/queue/new", async (req, res) => {
    try {
      const queueItem = await storage.createQueueItem({});
      broadcastQueueUpdate();
      res.json(queueItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to create new queue item" });
    }
  });
  
  // Call next number
  app.post("/api/queue/next", async (req, res) => {
    try {
      const status = await storage.getQueueStatus();
      
      if (status.nextNumbers.length === 0) {
        return res.status(400).json({ error: "No more numbers in queue" });
      }
      
      const nextNumber = status.nextNumbers[0];
      await storage.setCurrentNumber(nextNumber);
      
      broadcastQueueUpdate();
      res.json({ success: true, currentNumber: nextNumber });
    } catch (error) {
      res.status(500).json({ error: "Failed to call next number" });
    }
  });
  
  // Call specific number
  app.post("/api/queue/call/:number", async (req, res) => {
    try {
      const number = parseInt(req.params.number);
      
      if (isNaN(number)) {
        return res.status(400).json({ error: "Invalid number format" });
      }
      
      const queueItem = await storage.getQueueItem(number);
      
      if (!queueItem) {
        return res.status(404).json({ error: "Queue item not found" });
      }
      
      await storage.setCurrentNumber(number);
      
      broadcastQueueUpdate();
      res.json({ success: true, currentNumber: number });
    } catch (error) {
      res.status(500).json({ error: "Failed to call number" });
    }
  });
  
  // Mark number as complete
  app.post("/api/queue/complete/:number", async (req, res) => {
    try {
      const number = parseInt(req.params.number);
      
      if (isNaN(number)) {
        return res.status(400).json({ error: "Invalid number format" });
      }
      
      const queueItem = await storage.updateQueueItemStatus(number, "completed");
      
      if (!queueItem) {
        return res.status(404).json({ error: "Queue item not found" });
      }
      
      broadcastQueueUpdate();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete number" });
    }
  });
  
  // Remove number from queue
  app.delete("/api/queue/item/:number", async (req, res) => {
    try {
      const number = parseInt(req.params.number);
      
      if (isNaN(number)) {
        return res.status(400).json({ error: "Invalid number format" });
      }
      
      const success = await storage.deleteQueueItem(number);
      
      if (!success) {
        return res.status(404).json({ error: "Queue item not found" });
      }
      
      // If deleted item was the current number, reset current number
      const currentNumber = await storage.getCurrentNumber();
      if (currentNumber === number) {
        await storage.setCurrentNumber(0);
      }
      
      broadcastQueueUpdate();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove number from queue" });
    }
  });
  
  // Reset queue
  app.post("/api/queue/reset", async (req, res) => {
    try {
      await storage.resetQueue();
      broadcastQueueUpdate();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset queue" });
    }
  });
  
  // Toggle sound
  app.post("/api/settings/sound", async (req, res) => {
    try {
      const { enabled } = req.body;
      
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: "Invalid enabled value" });
      }
      
      await storage.setSoundEnabled(enabled);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update sound setting" });
    }
  });
  
  // Toggle visual alerts
  app.post("/api/settings/visual-alerts", async (req, res) => {
    try {
      const { enabled } = req.body;
      
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: "Invalid enabled value" });
      }
      
      await storage.setVisualAlertsEnabled(enabled);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update visual alerts setting" });
    }
  });

  // User Management API
  
  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  // Create a new user
  app.post("/api/users", async (req, res) => {
    try {
      const { username, password, isAdmin } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Check if username exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Create the user
      const user = await storage.createUser({
        username,
        password,
        isAdmin: isAdmin === true,
        isApproved: false, // New users need approval
      });
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  
  // Update user (e.g., approve user)
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isApproved, isAdmin } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const updatedUser = await storage.updateUser(id, {
        isApproved: typeof isApproved === 'boolean' ? isApproved : undefined,
        isAdmin: typeof isAdmin === 'boolean' ? isAdmin : undefined,
      });
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  
  // Delete user
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const deleted = await storage.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  return httpServer;
}
