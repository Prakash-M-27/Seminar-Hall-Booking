import { Router, Response } from "express";
import { User } from "../models/User";
import { auth, isAdmin, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["STAFF", "ADMIN"]).default("STAFF"),
  department: z.string().min(1),
});

router.get("/", auth, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select("-password").sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = createUserSchema.parse(req.body);
    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user = new User(validated);
    await user.save();

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.errors });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
