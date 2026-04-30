import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

// Simple persistent store
const DB_FILE = "users_db.json";

interface UserProfile {
  userId: number;
  username: string;
  invitedCount: number;
  balance: number;
  isNew: boolean;
  referredBy: number | null;
}

let db: { [key: number]: UserProfile } = {};

if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (e) {
    console.error("Error loading DB", e);
    db = {};
  }
}

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API to initialize user and handle referrals
  app.post("/api/user/init", (req, res) => {
    const { userId, username, startParam } = req.body;

    if (!userId) return res.status(400).json({ error: "Missing userId" });

    let user = db[userId];
    let isNewlyCreated = false;

    if (!user) {
      console.log(`[USER_INIT] New user detected: ${userId} (${username})`);
      // New User Registration
      user = {
        userId,
        username: username || `user_${userId}`,
        invitedCount: 0,
        balance: 0,
        isNew: true,
        referredBy: startParam ? parseInt(startParam) : null
      };
      
      db[userId] = user;
      isNewlyCreated = true;

      // Handle Referral Reward Logic
      if (user.referredBy && user.referredBy !== userId) {
        console.log(`[REFERRAL] User ${userId} referred by ${user.referredBy}`);
        
        if (!db[user.referredBy]) {
          console.log(`[REFERRAL] Referrer ${user.referredBy} not found in DB. Creating placeholder.`);
          db[user.referredBy] = {
            userId: user.referredBy,
            username: `user_${user.referredBy}`,
            invitedCount: 0,
            balance: 0,
            isNew: false,
            referredBy: null
          };
        }
        
        const referrer = db[user.referredBy];
        referrer.invitedCount += 1;
        referrer.balance += 0.35; // $0.35 reward
        console.log(`[REFERRAL] Credited ${user.referredBy}. New balance: ${referrer.balance}, Total invited: ${referrer.invitedCount}`);
      }
      
      saveDb();
    } else {
      console.log(`[USER_INIT] Existing user logged in: ${userId} (${username})`);
      // Existing user - update username if changed
      if (username && user.username !== username) {
        user.username = username;
        saveDb();
      }
      user.isNew = false;
    }

    res.json(user);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
