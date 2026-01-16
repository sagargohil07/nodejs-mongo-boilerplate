import express, { Application, Router } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import fileRoutes from "./routes/file.routes";

import { errorHandler } from "./middlewares/error.middleware";
import { initializeSocket } from "./socket/socker.handler";
import { connectDB } from "./config/database";

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/", (req, res) => {
  res.json({
    status: 200,
    message: "API is running successfully",
    data: {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    },
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/files", fileRoutes);

initializeSocket(io);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.IO server ready`);
      console.log(` Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (err: Error) => {
  console.error("Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

export { app, io };
