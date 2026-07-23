import { Router, Response } from "express";
import { Booking } from "../models/Booking";
import { SeminarHall } from "../models/SeminarHall";
import { auth, AuthRequest } from "../middleware/auth";

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

router.get("/", auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    if (!date) {
      res.status(400).json({ message: "Date parameter is required" });
      return;
    }

    const queryDate = new Date(date as string);
    queryDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(queryDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const halls = await SeminarHall.find({ isActive: true }).sort({ name: 1 });
    const bookings = await Booking.find({
      date: { $gte: queryDate, $lt: nextDate },
      status: { $ne: "CANCELLED" },
    }).populate("user", "name department");

    const availability = halls.map((hall) => {
      const hallBookings = bookings.filter(
        (b) => b.hall.toString() === hall._id.toString()
      );

      const today = new Date();
      const isToday =
        queryDate.getFullYear() === today.getFullYear() &&
        queryDate.getMonth() === today.getMonth() &&
        queryDate.getDate() === today.getDate();

      const periods = PERIODS.map((p) => {
        const booking = hallBookings.find((b) => b.period === p.period);

        if (isToday) {
          const periodEndHour = parseInt(p.time.split(" - ")[1].split(":")[0]);
          const periodEndMin = parseInt(p.time.split(" - ")[1].split(":")[1]);
          const periodEnd = new Date(today);
          periodEnd.setHours(periodEndHour, periodEndMin, 0, 0);

          if (today > periodEnd) {
            return {
              period: p.period,
              time: p.time,
              isBooked: true,
              isPast: true,
              booking: booking
                ? {
                    id: booking._id,
                    purpose: booking.purpose,
                    status: booking.status,
                    bookedBy: booking.user,
                  }
                : null,
            };
          }
        }

        return {
          period: p.period,
          time: p.time,
          isBooked: !!booking,
          isPast: false,
          booking: booking
            ? {
                id: booking._id,
                purpose: booking.purpose,
                status: booking.status,
                bookedBy: booking.user,
              }
            : null,
        };
      });

      return {
        hall: { id: hall._id, name: hall.name, capacity: hall.capacity, location: hall.location },
        periods,
      };
    });

    res.json({ date: queryDate, availability });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
