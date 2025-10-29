import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { db, testConnection } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection middleware
app.use(async (req, res, next) => {
  if (!db) {
    return res.status(503).json({ 
      error: "Database connection unavailable",
      message: "Please try again later"
    });
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);

// Enhanced health check
app.get("/api/health", async (req, res) => {
  try {
    const dbStatus = db ? "connected" : "disconnected";
    
    res.status(200).json({ 
      message: "Server is running!",
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(200).json({ 
      message: "Server is running but database check failed",
      database: "error",
      timestamp: new Date().toISOString()
    });
  }
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Coffee Shop POS API",
    status: "OK",
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;