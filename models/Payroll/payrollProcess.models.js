import mongoose from 'mongoose';

const PayrollProcessSchema = new mongoose.Schema({
  payroll_id: {
    type: Number,
    required: true,
    unique: true,
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
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Partially Approved', 'Approved'],
    default: 'Draft',
  },
  employerId: {
    type: String,
    required: true,
  },
  processedEmployees: [{
    type: String, // Stores employee IDs that have been processed
    default: [],
  }],
  totalAmount: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

 const PayrollProcess = mongoose.models.PayrollProcess || mongoose.model('PayrollProcess', PayrollProcessSchema);
export default PayrollProcess;