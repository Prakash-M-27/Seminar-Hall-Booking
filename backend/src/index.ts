import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./lib/db";
import authRoutes from "./routes/auth";
import hallRoutes from "./routes/halls";
import bookingRoutes from "./routes/bookings";
import availabilityRoutes from "./routes/availability";
import userRoutes from "./routes/users";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/halls", hallRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;
