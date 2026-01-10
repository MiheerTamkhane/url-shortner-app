import express, { Application, Request, Response } from "express";

const app: Application = express();

/**
 * Middlewares
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Health check
 */
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Example route
 */
app.get("/", (_req: Request, res: Response) => {
  res.send("🚀 TypeScript backend is running");
});

/**
 * 404 handler
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: "Route not found",
  });
});

export default app;
