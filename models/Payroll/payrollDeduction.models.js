// models/DeductionDetail.js
import mongoose from 'mongoose';

const PayrollDeductionShema = new mongoose.Schema({
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
  deduction_id: {
    type: String,
    required: true,
  },
  deduction_amount: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

export default mongoose.models.PayrollDeduction || mongoose.model('PayrollDeduction', PayrollDeductionShema);
