import mongoose from 'mongoose';

const PayrollProcessSchema = new mongoose.Schema({
  payroll_id: {
    type: Number,
    required: true,
    unique: true, // Primary key
  },
  date_from: {
    type: Date,
    required: true,
  },
  date_to: {
    type: Date,
    required: true,
  },
  month_no: {
    type: Number,
    required: true,
  },
  week_no: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  status:{
    type:String,
    default:"Pending"
  },
  employerId: {
    type: String,
    required: true,
  },
});

 const PayrollProcess = mongoose.models.PayrollProcess || mongoose.model('PayrollProcess', PayrollProcessSchema);
export default PayrollProcess;