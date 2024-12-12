
import mongoose from "mongoose";

// Pay Schedule Setup Model
const EmployeeTypeSchema = new mongoose.Schema({
    employee_type: {
    type: String,
    required: true,
    maxlength: 150
  },
  employee_type_description: {
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

 const EmployeeType = mongoose.models.EmployeeType || mongoose.model('EmployeeType', EmployeeTypeSchema);
export default EmployeeType;