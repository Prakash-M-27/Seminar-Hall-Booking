import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBooking extends Document {
  hall: Types.ObjectId;
  user: Types.ObjectId;
  date: Date;
  period: number;
  purpose: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  hall: { type: Schema.Types.ObjectId, ref: "SeminarHall", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  period: { type: Number, required: true, min: 1, max: 8 },
  purpose: { type: String, required: true, trim: true },
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"], default: "PENDING" },
  createdAt: { type: Date, default: Date.now },
});

bookingSchema.index({ hall: 1, date: 1, period: 1 }, { unique: true, partialFilterExpression: { status: { $ne: "CANCELLED" } } });

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
