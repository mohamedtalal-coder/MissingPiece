import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
): Promise<void> {
  await connectDB();
  app(request, response);
}