import express, { type Application } from "express";
import cors from "cors";
import morgan from "morgan";

import { errorHandler, notFound } from "./shared/middleware/errorHandler.js";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Feature routes get mounted here as each one is built, e.g.:
// app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;