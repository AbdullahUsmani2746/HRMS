
import mongoose from "mongoose";

// Pay Schedule Setup Model
const PayScheduleSchema = new mongoose.Schema({
    pay_schedule: {
    type: String,
    required: true,
    maxlength: 150
  },
  pay_schedule_description: {
    type: String,
    required: true,
    maxlength: 150
  },
  employerId:{
    type: String,
    required: true,
    maxlength: 12
  }

});

 const PaySchedule = mongoose.models.PaySchedule || mongoose.model('PaySchedule', PayScheduleSchema);
export default PaySchedule;