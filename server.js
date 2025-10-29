import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

// Simple health check without database
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    message: "Server is running without DB!",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Coffee Shop POS API - Basic Version",
    status: "OK"
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;