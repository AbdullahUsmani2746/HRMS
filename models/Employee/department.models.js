
import mongoose from "mongoose";

// JobTitle Setup Model
const DepartmentSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    maxlength: 150
  },
  department_description: {
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

 const Department = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
export default Department;