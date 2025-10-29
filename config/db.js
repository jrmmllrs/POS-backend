import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// ✅ Create a pool (supports .getConnection and .query)
export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // Changed from DB_PASS to DB_PASSWORD
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // Added port for clarity
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false // SSL for production
});

console.log("✅ MySQL connection pool created!");

// Optional: Test connection on startup
export const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Database connection established successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

// Call this function when your app starts
testConnection();