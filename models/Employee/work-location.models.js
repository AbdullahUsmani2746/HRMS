
import mongoose from "mongoose";

// Pay Schedule Setup Model
const WorkLocationSchema = new mongoose.Schema({
    work_location: {
    type: String,
    required: true,
    maxlength: 150
  },
  work_location_description: {
    type: String,
    required: true,
    maxlength: 150
  },

  employerId:{
    type: String,
    required: true,
    maxlength: 150
  }

});

 const WorkLocation = mongoose.models.WorkLocation || mongoose.model('WorkLocation', WorkLocationSchema);
export default WorkLocation;