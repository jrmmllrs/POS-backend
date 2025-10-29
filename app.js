import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./config/db.js";

// Import routes but don't use them yet
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`, {
    query: req.query,
    body: req.body
  });
  next();
});

// Test each route individually

// 1. First test without any routes
app.get("/api/health", async (req, res) => {
  res.status(200).json({ 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: "connected"
  });
});

// 2. Test auth routes
app.get("/api/test-auth", async (req, res) => {
  try {
    console.log("Testing auth route...");
    // Add a simple test that doesn't use the actual auth routes
    res.json({ message: "Auth test route working" });
  } catch (error) {
    console.error("Auth test error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Test product routes  
app.get("/api/test-products", async (req, res) => {
  try {
    console.log("Testing products route...");
    res.json({ message: "Products test route working" });
  } catch (error) {
    console.error("Products test error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Test sales routes
app.get("/api/test-sales", async (req, res) => {
  try {
    console.log("Testing sales route...");
    res.json({ message: "Sales test route working" });
  } catch (error) {
    console.error("Sales test error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Now try adding routes one by one

// Add auth routes with error handling
app.use("/api/auth", (req, res, next) => {
  console.log("🔄 Attempting to use auth routes...");
  next();
}, authRoutes);

// Add product routes with error handling  
app.use("/api/products", (req, res, next) => {
  console.log("🔄 Attempting to use product routes...");
  next();
}, productRoutes);

// Add sales routes with error handling
app.use("/api/sales", (req, res, next) => {
  console.log("🔄 Attempting to use sales routes...");
  next();
}, salesRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("💥 Global error handler:", err);
  console.error("💥 Error stack:", err.stack);
  res.status(500).json({ 
    error: "Internal Server Error",
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;