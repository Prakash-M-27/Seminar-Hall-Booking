import mongoose, { Document, Schema } from "mongoose";

export interface ISeminarHall extends Document {
  name: string;
  capacity: number;
  location: string;
  isActive: boolean;
}

const seminarHallSchema = new Schema<ISeminarHall>({
  name: { type: String, required: true, unique: true, trim: true },
  capacity: { type: Number, required: true, min: 1 },
  location: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
});

export const SeminarHall = mongoose.model<ISeminarHall>("SeminarHall", seminarHallSchema);
