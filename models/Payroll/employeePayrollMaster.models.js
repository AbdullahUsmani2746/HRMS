import mongoose from 'mongoose';

const EmployeePayrollMasterSchema = new mongoose.Schema({
  payroll_id: { type: Number, required: true, unique: true },
  employee_id: { type: String, required: true }, // Validate from Employee Master
  employer_id: { type: String, required: true }, // Validate from Employer Master
  total_work_hours: { type: Number, required: true }, // From Time Data
  rate_per_hour: { type: Number, required: true },
  total_work_hours_amount: { type: Number, required: true }, // Calculated
  total_ot_hours: { type: Number, required: true }, // From Time Data
  ot_rate: { type: Number, required: true },
  total_ot_amount: { type: Number, required: true }, // Calculated
  total_holiday_hours: { type: Number, required: true }, // From Time Data
  total_holiday_amount: { type: Number, required: true }, // Calculated
  total_allowances_amount: { type: Number, required: true }, // Calculated from breakup data
  total_deduction_amount: { type: Number, required: true }, // Calculated from breakup data
  net_payable: { type: Number, required: true }, // Calculated
  status: { type: String, required: true, enum: ['APPROVED', 'REJECTED', 'HOLD'] }, // Approved/Rejected/Hold
});

export default mongoose.models.EmployeePayrollMaster || mongoose.model('EmployeePayrollMaster', EmployeePayrollMasterSchema);
