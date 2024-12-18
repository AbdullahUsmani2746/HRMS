// models/Attendance.js

import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    clientId: {
        type: String,
        required: true,
      },
    employeeId: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    breakDuration: {
        type: String, // Break duration in seconds
        default: 0,
      },
    checkOutTime: {
      type: Date,
      default: null,
    },
    totalWorkingHours: {
      type: String,
      default: "0h 0m",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", AttendanceSchema);
