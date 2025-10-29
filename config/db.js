import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let db;

try {
  db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    acquireTimeout: 10000,
    connectTimeout: 10000,
    timeout: 10000,
  });
  
  console.log("✅ MySQL connection pool created!");
} catch (error) {
  console.error("❌ Failed to create database pool:", error.message);
  // Don't crash the app, let it start without DB connection
  db = null;
}

export { db };

// Test connection (but don't block startup)
export const testConnection = async () => {
  if (!db) {
    console.error("❌ Database pool not available");
    return false;
  }
  
  try {
    const connection = await db.getConnection();
    console.log('✅ Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};