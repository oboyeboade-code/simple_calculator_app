// import "./env.js";
import express from "express";
import cors from "cors";
import syncRoutes from "./sync.routes.js";

const app = express();

const PORT = process.env.PORT || 5000;
const APP_URL = process.env.APP_URL;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://127.0.0.1:5500";

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "x-session-id"],
  })
);

// Health Check
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API Live",
  });
});

// Routes
app.use("/api", syncRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(
    `🚀 Calculator Backend listening on ${APP_URL || `http://localhost:${PORT}`}`
  );
});