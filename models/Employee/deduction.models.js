
import mongoose from "mongoose";

// Pay Schedule Setup Model
const DeductionSchema = new mongoose.Schema({
    deduction: {
    type: String,
    required: true,
    maxlength: 150
  },

  deduction_description: {
    type: String,
    required: true,
    maxlength: 150
  },
  deduction_rate: {
    type: String,
    required: true,
    maxlength: 150
  },

  employerId:{
    type: String,
    required: true,
    maxlength: 12
  }

});

 const Deduction = mongoose.models.Deduction || mongoose.model('Deduction', DeductionSchema);
export default Deduction;