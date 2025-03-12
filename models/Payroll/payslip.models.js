import mongoose from 'mongoose';

const payslipSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  employerId: {
    type: String,
    required: true,
  },
  payrollId: {
    type: Number,
    required: true,
  },
  employeeName: {
    type: String,
    required: true
  },
  npfNumber: {
    type: String,
    required: true
  },
  employeeEmail: {
    type: String,
    required: true
  },
  monthNo: {
    type: Number,
    required: true,
  },
  weekNo: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  payType: {
    type: String,
    enum: ['HOUR', 'SALARY'],
    required: true
  },
  payPeriodDetails: {
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
    totalDays: {
      type: Number,
      required: true
    },
    expectedBaseHours: {
      type: Number,
      required: true
    }
  },
  workDetails: {
    totalWorkHours: {
      type: Number,
      required: true
    },
    overtimeHours: {
      type: Number,
      default: 0
    },
    hourlyRate: {
      type: Number,
      required: true
    },
    overtimeRate: {
      type: Number,
      required: true
    }
  },
  payrollBreakdown: {
    baseSalary: {
      type: Number,
      required: true
    },
    allowances: {
      type: Number,
      default: 0
    },
    deductions: {
      paye: {
        type: Number,
        required: true
      },
      acc: {
        type: Number,
        required: true
      },
      npf: {
        type: Number,
        required: true
      },
      other: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        required: true
      }
    },
    employerContributions: {
      acc: {
        type: Number,
        required: true
      },
      npf: {
        type: Number,
        required: true
      },
      total: {
        type: Number,
        required: true
      }
    },
    overtimePay: {
      type: Number,
      default: 0
    },
    netPayable: {
      type: Number,
      required: true
    }
  },
  settings: {
    baseHoursPerWeek: {
      type: Number,
      required: true
    },
    overtimeMultiplier: {
      type: Number,
      required: true
    },
    weeklyPayMultipliers: {
      weekly: {
        type: Number,
        required: true
      },
      fortnightly: {
        type: Number,
        required: true
      },
      monthly: {
        type: Number,
        required: true
      }
    },
    maxRegularHoursPerDay: {
      type: Number,
      required: true
    },
    workingDaysPerWeek: {
      type: Number,
      required: true
    },
    tax: {
      acc: {
        employee: {
          type: Number,
          required: true
        },
        employer: {
          type: Number,
          required: true
        }
      },
      npf: {
        employee: {
          type: Number,
          required: true
        },
        employer: {
          type: Number,
          required: true
        }
      }
    },
    payeBrackets: [{
      id: Number,
      min: Number,
      max: Number,
      rate: Number
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now

  }
}, {
  timestamps: true
});

// Indexes for common queries
// payslipSchema.index({ employeeId: 1, payrollId: 1 }, { unique: true });
// payslipSchema.index({ employerId: 1, 'payPeriodDetails.startDate': 1 });

// Calculate total cost to employer
payslipSchema.virtual('totalCost').get(function() {
  return this.payrollBreakdown.baseSalary + 
         this.payrollBreakdown.allowances + 
         this.payrollBreakdown.overtimePay + 
         this.payrollBreakdown.employerContributions.total;
});

const Payslip = mongoose.model('Payslip', payslipSchema);

export default Payslip;