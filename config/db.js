import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Aiven MySQL requires specific SSL configuration
const createDbPool = () => {
  // Check if all required environment variables are present
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error("❌ Missing required database environment variables");
    return null;
  }

  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      ssl: { 
        rejectUnauthorized: false  // This is required for Aiven
      },
      acquireTimeout: 15000,
      connectTimeout: 15000,
      timeout: 10000,
      // Additional Aiven-specific options
      charset: 'utf8mb4',
      timezone: '+00:00'
    });

    console.log("✅ MySQL connection pool created!");
    console.log(`🔗 Connecting to: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    
    return pool;
  } catch (error) {
    console.error("❌ Failed to create database pool:", error.message);
    return null;
  }
};

const db = createDbPool();

export { db };

// Test connection with better logging
export const testConnection = async () => {
  if (!db) {
    console.error("❌ Database pool not available");
    return false;
  }
  
  try {
    console.log("🔄 Testing database connection...");
    const connection = await db.getConnection();
    console.log('✅ Database connection established successfully');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('✅ Database query test successful:', rows);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('❌ Error details:', error);
    return false;
  }
};