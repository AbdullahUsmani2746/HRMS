
import mongoose from "mongoose";

// JobTitle Setup Model
const ManagerSchema = new mongoose.Schema({
  manager: {
    type: String,
    required: true,
    maxlength: 150
  },
  clientId: {
    type: String,
    required: true,
    maxlength: 12
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Department",
    required: true,
  }, 

  employeeId:{
    type: String,
    required: true,
    maxlength: 12
  }
});

 const Manager = mongoose.models.Manager || mongoose.model('Manager', ManagerSchema);
export default Manager;