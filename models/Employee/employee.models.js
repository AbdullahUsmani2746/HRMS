import mongoose from "mongoose";
import Employer from '@/models/employer.models'
const EmployeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    maxlength: 25
  },
  middleName: {
    type: String,
    maxlength: 25
  },
  surname: {
    type: String,
    required: true,
    maxlength: 25
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['MALE', 'FEMALE', 'OTHER'],
    maxlength: 25
  },
  phoneNumber: {
    type: String,
    required: true,
    maxlength: 25
  },
  emailAddress: {
    type: String,
    required: true,
    maxlength: 100,
    validate: {
      validator: (v) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v),
      message: props => `${props.value} is not a valid email address!`
    }
  },
  village: {
    type: String,
    required: true,
    maxlength: 25
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE'],
    maxlength: 25
  },
  hireDate: {
    type: Date,
    required: true
  },
  jobTitle: {
    type: String,
    required: true,
    maxlength: 25
  },
  department: {
    type: String,
    required: true,
    maxlength: 25
  },
  paySchedule: {
    type: String,
    required: true,
    maxlength: 25
  },
  workLocation: {
    type: String,
    required: true,
    maxlength: 25
  },
  manager: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: "Employee", // Refers to the Employee collection for hierarchical relations
    // default: null

    type: String,
    required: true,
    maxlength: 25
  },
  clientId: {
    type: String, // Use String if it's not an ObjectId
    required: true,
    validate: {
      validator: async function (value) {
        const employer = await Employer.findOne({ employerId: value });
        return !!employer; // Ensures the clientId exists in the Employer collection
      },
      message: "Invalid clientId. No matching Employer found.",
    },
  },
  employeeId: {
    type: String,
    required: true,
    unique: true // Auto-generated composite key
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['DIRECT DEPOSIT', 'CHEQUE'],
    maxlength: 25
  },
  bankName: {
    type: String,
    required: true,
    maxlength: 25
  },
  accountName: {
    type: String,
    required: true,
    maxlength: 25
  },
  accountNumber: {
    type: String,
    required: true,
    maxlength: 25
  },
  payType: {
    type: String,
    required: true,
    enum: ['HOUR', 'WEEK', 'MONTH'],
    maxlength: 25
  },
  ratePerHour: {
    type: Number,
    required: true
  },
  payFrequency: {
    type: String,
    required: true,
    enum: ['YEAR', 'MONTH', 'WEEK'],
    maxlength: 25
  },
  employeeType: {
    type: String,
    required: true,
    maxlength: 25
  },
  costCenter: {
    type: String,
    required: true,
    maxlength: 25
  },

  allownces:{
    type:Array,
    required: true,
  },
  deductions:{
    type:Array,
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  updatedOn: {
    type: Date,
    default: Date.now
  }
});

const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
export default Employee;
