import mongoose from "mongoose";

const BreakSchema = new mongoose.Schema({
  breakIn: { type: Date },
  breakOut: { type: Date },
});

const AttendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  breaks: [BreakSchema],
  totalWorkingHours: { type: String },
  totalBreakDuration: { type: String },
  isOnBreak: { type: Boolean, default: false },
  status: { type: String, default: "Pending" },
});

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", AttendanceSchema);
