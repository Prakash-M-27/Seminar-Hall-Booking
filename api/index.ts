import { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "../backend/src/routes/auth";
import hallRoutes from "../backend/src/routes/halls";
import bookingRoutes from "../backend/src/routes/bookings";
import availabilityRoutes from "../backend/src/routes/availability";
import userRoutes from "../backend/src/routes/users";

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  const conn = await mongoose.connect(process.env.MONGODB_URI!, {
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 30000,
  });
  isConnected = true;
  console.log(`MongoDB connected: ${conn.connection.host}`);
}

const app = express();

app.use(cors({
  origin: process.env.VERCEL_URL
    ? [`https://${process.env.VERCEL_URL}`, `https://hall-booking-*.vercel.app`]
    : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/halls", hallRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();
  return app(req, res);
}
