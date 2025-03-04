
import mongoose from "mongoose";

// Pay Schedule Setup Model
const DeductionSchema = new mongoose.Schema({
  // Personal Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  
  // Account Information
  holdingAccount: {
    type: String,
    enum: ['Bank', 'Wages', 'Savings', 'Loans'],
    required: true
  },
  
  // Calculation Details
  calculation: {
    type: String,
    required: true,
    enum: ['Amount Per Pay Period','Percentage', 'Time x Rate', 'Earning Rate'],
  },
  
  // Calculation Options
  payslipYTD: {
    type: Boolean,
    default: false
  },
  statutory: {
    type: Boolean,
    default: false
  },
  
  
  // Payee Details
  payeeDetails: {
    bank: {
      type: String,
      required: true,
      enum: ['ANZ', 'BSP', 'NBS', 'SCB', 'Others/Overseas']
    },
    accountName: {
      type: String,
      required: true,
      trim: true
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true
    },
    employerNumberAtFund: {
      type: String,
      required: true
    }
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the 'updatedAt' field on save
DeductionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

 const Deduction = mongoose.models.Deduction || mongoose.model('Deduction', DeductionSchema);
export default Deduction;