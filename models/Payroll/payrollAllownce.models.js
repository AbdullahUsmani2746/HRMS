// models/AllowanceDetail.js
import mongoose from 'mongoose';

const PayrollAllownceShema = new mongoose.Schema({
  payroll_id: {
    type: String,
    required: true,
  },
  month_no: {
    type: String,
    required: true,
  },
  week_no: {
    type: Number,
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
  },
  employerId: {
    type: String,
    required: true,
  },
  allowance_id: {
    type: String,
    required: true,
  },
  allowance_amount: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

export default mongoose.models.PayrollAllownce || mongoose.model('PayrollAllownce', PayrollAllownceShema);
