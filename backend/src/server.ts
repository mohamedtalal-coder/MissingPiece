import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT ?? 5000;

async function startServer(): Promise<void> {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Vercel loads `src/app.ts` as the Express entry. Do not open a port or
// connect to Mongo at module load during the Vercel build/runtime bootstrap.
if (!process.env["VERCEL"]) {
  void startServer();
}

export default app;
