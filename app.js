import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./config/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Simple middleware to check db status
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Health check with basic db check
app.get("/api/health", async (req, res) => {
  try {
    const healthInfo = {
      message: "Server is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: db ? "pool_created" : "pool_failed"
    };

    // Try to query database if pool exists
    if (db) {
      try {
        const [result] = await db.execute("SELECT 1 as test");
        healthInfo.database = "connected";
        healthInfo.db_test = result[0].test;
      } catch (dbError) {
        healthInfo.database = "query_failed";
        healthInfo.db_error = dbError.message;
      }
    }

    res.status(200).json(healthInfo);
  } catch (error) {
    res.status(200).json({
      message: "Server running but health check failed",
      error: error.message
    });
  }
});

// Test database connection specifically
app.get("/api/db-test", async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: "Database pool not created" });
  }

  try {
    const [result] = await db.execute("SELECT 1 + 1 as calculation, NOW() as time");
    res.json({
      success: true,
      data: result[0],
      message: "Database query successful"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
});

// Simple route without database
app.get("/", (req, res) => {
  res.json({ 
    message: "Coffee Shop POS API",
    status: "OK" 
  });
});

export default app;