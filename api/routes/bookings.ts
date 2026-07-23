import { Router, Response } from "express";
import { Booking } from "../models/Booking";
import { SeminarHall } from "../models/SeminarHall";
import { auth, isAdmin, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const PERIODS = [
  { period: 1, time: "9:00 - 9:55" },
  { period: 2, time: "9:55 - 10:50" },
  { period: 3, time: "11:05 - 12:00" },
  { period: 4, time: "12:00 - 12:55" },
  { period: 5, time: "1:45 - 2:40" },
  { period: 6, time: "2:40 - 3:35" },
  { period: 7, time: "3:50 - 4:45" },
];

const bookingSchema = z.object({
  hallId: z.string(),
  date: z.string(),
  period: z.number().min(1).max(7),
  purpose: z.string().min(1),
});

router.get("/", auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, hallId, status } = req.query;
    const filter: any = {};

    if (date) {
      const start = new Date(date as string);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }
    if (hallId) filter.hall = hallId;
    if (status) filter.status = status;

    if (req.user?.role === "STAFF") {
      filter.user = req.user._id;
    }

    const bookings = await Booking.find(filter)
      .populate("hall", "name location")
      .populate("user", "name email department")
      .sort({ date: 1, period: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = bookingSchema.parse(req.body);

    const hall = await SeminarHall.findById(validated.hallId);
    if (!hall) {
      res.status(404).json({ message: "Hall not found" });
      return;
    }

    const date = new Date(validated.date);
    date.setHours(0, 0, 0, 0);

    if (date.getDay() === 0) {
      res.status(400).json({ message: "Cannot book on Sundays — halls are closed" });
      return;
    }

    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (isToday) {
      const period = PERIODS.find((p) => p.period === validated.period);
      if (period) {
        const periodEndHour = parseInt(period.time.split(" - ")[1].split(":")[0]);
        const periodEndMin = parseInt(period.time.split(" - ")[1].split(":")[1]);
        const periodEnd = new Date(now);
        periodEnd.setHours(periodEndHour, periodEndMin, 0, 0);
        if (now > periodEnd) {
          res.status(400).json({ message: "Cannot book a past period" });
          return;
        }
      }
    }

    const existingBooking = await Booking.findOne({
      hall: validated.hallId,
      date,
      period: validated.period,
      status: { $ne: "CANCELLED" },
    });

    if (existingBooking) {
      res.status(400).json({ message: "This slot is already booked" });
      return;
    }

    const booking = new Booking({
      hall: validated.hallId,
      user: req.user!._id,
      date,
      period: validated.period,
      purpose: validated.purpose,
      status: "APPROVED",
    });

    await booking.save();
    await booking.populate("hall", "name location");
    await booking.populate("user", "name email department");

    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.errors });
      return;
    }
    if ((error as any).code === 11000) {
      res.status(400).json({ message: "This slot is already booked" });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/cancel", auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    if (req.user?.role === "STAFF" && booking.user.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    booking.status = "CANCELLED";
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/approve", auth, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "APPROVED" },
      { new: true }
    );
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/reject", auth, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "REJECTED" },
      { new: true }
    );
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
