import { Router, Response } from "express";
import { SeminarHall } from "../models/SeminarHall";
import { auth, isAdmin, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const hallSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().min(1),
  location: z.string().min(1),
});

router.get("/", auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const halls = await SeminarHall.find({ isActive: true }).sort({ name: 1 });
    res.json(halls);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = hallSchema.parse(req.body);
    const hall = new SeminarHall(validated);
    await hall.save();
    res.status(201).json(hall);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.errors });
      return;
    }
    if ((error as any).code === 11000) {
      res.status(400).json({ message: "Hall with this name already exists" });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", auth, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = hallSchema.partial().parse(req.body);
    const hall = await SeminarHall.findByIdAndUpdate(req.params.id, validated, { new: true });
    if (!hall) {
      res.status(404).json({ message: "Hall not found" });
      return;
    }
    res.json(hall);
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
    const hall = await SeminarHall.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!hall) {
      res.status(404).json({ message: "Hall not found" });
      return;
    }
    res.json({ message: "Hall deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
