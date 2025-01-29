
import mongoose from "mongoose";

// Employer Setup Model
const EmployerSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    maxlength: 150
  },
  email: {
    type: String,
    required: true,
    maxlength: 100,
    validate: {
      validator: (v) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v),
      message: props => `${props.value} is not a valid email address!`
    }
  },
  address: {
    type: String,
    required: true,
    maxlength: 100
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },

  state: {
    type: String,
    required: true
  },
  cpFirstName: {
    type: String,
    required: true,
    maxlength: 100
  },
  cpMiddleName: {
    type: String,
    maxlength: 100
  },
  cpSurname: {
    type: String,
    required: true,
    maxlength: 100
  },
  cpEmail: {
    type: String,
    required: true,
    maxlength: 100,
    validate: {
      validator: (v) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v),
      message: props => `${props.value} is not a valid email address!`
    }
  },
  cpPhoneNumber: {
    type: String,
    required: true,
    maxlength: 25
  },
  cpAddress: {
    type: String,
    maxlength: 100
  },
  employerId: {
    type: String,
    required: true,
    maxlength: 25,
    unique: true
  },
  subscriptionPlan: {
    type: String,
    required: true
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  activatedOn: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    maxlength: 25,
    enum: ['ACTIVE', 'INACTIVE']
  },
  paymentMethod: {
    type: String,
    required: true,
    maxlength: 25,
    enum: [ 'DIRECT DEPOSIT', 'CHEQUE']
  },
  terms: {
    type: String,
    required: true,
    maxlength: 25,
    enum: ['MONTHLY', 'ANNUAL']
  }
});

 const Employer = mongoose.models.Employer || mongoose.model('Employer', EmployerSchema);
export default Employer;