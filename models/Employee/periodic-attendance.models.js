// models/PeriodicAttendance.js

import mongoose from "mongoose";

const PeriodicAttendanceSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
    },
    dateRange: {
        type: String,
        required: true,
    },
    totalBreakHours: {
      type: String,
    },
    totalWorkingHours: {
      type: String,
    },
    leaves:{
        type: String,

    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PeriodicAttendance =
  mongoose.models.PeriodicAttendance ||
  mongoose.model("PeriodicAttendance", PeriodicAttendanceSchema);

export default PeriodicAttendance;
