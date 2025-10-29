import app from "./app.js";
import dotenv from "dotenv";
import serverless from "serverless-http";

dotenv.config();

const PORT = process.env.PORT || 5000;

// detect environment
const isVercel = !!process.env.VERCEL;

// 🟢 For Vercel (Serverless)
let handler;

if (isVercel) {
  console.log("⚙️ Running in Vercel serverless mode");
  handler = serverless(app);
} else {
  // 🟢 For local dev or other Node hosts
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on port ${PORT}`);
  });
}

// ✅ Always export something for Vercel to use
export default handler;
