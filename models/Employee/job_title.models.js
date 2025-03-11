
import mongoose from "mongoose";
import Department from "./department.models.js";

// JobTitle Setup Model
const JobTitleSchema = new mongoose.Schema({
  job_title: {
    type: String,
    required: true,
    maxlength: 150
  },
  job_title_description: {
    type: String,
    required: true,
    maxlength: 150
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Department",
    required: true,
  }, 

  employerId:{
    type: String,
    required: true,
    maxlength: 12
  }
});

 const JobTitle = mongoose.models.JobTitle || mongoose.model('JobTitle', JobTitleSchema);
export default JobTitle;