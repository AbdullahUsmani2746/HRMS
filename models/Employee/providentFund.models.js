// models/ProvidentFund.js
const mongoose = require('mongoose');

const ProvidentFundSchema = new mongoose.Schema({
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
    required: true
  },
  
  // Calculation Details
  calculation: {
    type: String,
    required: true,
    enum: ['Bank', 'Wages', 'Savings', 'Loans']
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
  
  // Payment Configuration
  amountPerPayPeriod: {
    type: String,
    enum: ['Percentage', 'Time x Rate', 'Earning Rate'],
    required: true
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
ProvidentFundSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ProvidentFund', ProvidentFundSchema);