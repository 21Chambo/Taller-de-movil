import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import sessionRoutes from "./routes/sessions.routes";
import publicAttendanceRoutes from "./routes/public-attendance.routes";
import academicRoutes from "./routes/academic.routes";

const app = express();

app.use(
  cors({
    origin: process.env.API_CORS_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "app-attendance-api",
    message: "Backend funcionando correctamente"
  });
});

app.get("/ready", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ready",
    database: "pending",
    message: "API lista para recibir solicitudes"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use(publicAttendanceRoutes);
app.use("/api/academic", academicRoutes);

export default app;

