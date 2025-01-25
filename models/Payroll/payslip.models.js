import mongoose from 'mongoose';

const PayslipSchema = new mongoose.Schema({
  employeeId: {
    type: String,
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
  employerId: {
    type: String,
    required: true,
  },

    grossPay: {
        type: Number,
        required: true,
    },

    netPayable: {
        type: Number,
        required: true,
    },

    deductions: {
        type: Number,
        required: true,
    },

    allowances: {
        type: Number,
        required: true,
    },


});

 const Payslip = mongoose.models.Payslip || mongoose.model('Payslip', PayslipSchema);
export default Payslip;