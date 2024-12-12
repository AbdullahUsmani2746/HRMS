
import mongoose from "mongoose";

// Pay Schedule Setup Model
const CostCenterSchema = new mongoose.Schema({
    cost_center: {
    type: String,
    required: true,
    maxlength: 150
  },
  cost_center_description: {
    type: String,
    required: true,
    maxlength: 150
  },
  employerId:{
    type: String,
    required: true,
    maxlength: 12  }

});

 const CostCenter = mongoose.models.CostCenter || mongoose.model('CostCenter', CostCenterSchema);
export default CostCenter;