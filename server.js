import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

// Check if we're in Vercel production environment
const isVercel = process.env.VERCEL === '1';

if (!isVercel) {
  // Local development - start the server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  });
}

// Export for Vercel (production)
export default app;