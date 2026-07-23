import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/User";
import { SeminarHall } from "./models/SeminarHall";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    const adminExists = await User.findOne({ email: "admin@college.edu" });
    if (!adminExists) {
      await User.create({
        name: "Admin",
        email: "admin@college.edu",
        password: "admin123",
        role: "ADMIN",
        department: "Administration",
      });
      console.log("Admin user created: admin@college.edu / admin123");
    }

    const hallsExist = await SeminarHall.countDocuments();
    if (hallsExist === 0) {
      await SeminarHall.insertMany([
        { name: "Seminar Hall A", capacity: 100, location: "Block A - Ground Floor" },
        { name: "Seminar Hall B", capacity: 80, location: "Block A - First Floor" },
        { name: "Seminar Hall C", capacity: 150, location: "Block B - Ground Floor" },
      ]);
      console.log("3 seminar halls created");
    }

    console.log("Seed completed!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();
