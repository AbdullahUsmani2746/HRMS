import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema({

    leave:{
        type:String,
        required:true,
        maxlength: 150,
    },

    leave_description:{
        type:String,
        required:true,
        maxlength: 150,

    },

    employerId:{
        type: String,
        required: true,
        maxlength: 12
      }
})

const Leave = mongoose.model.Leave || mongoose.model('Leave', LeaveSchema);
export default Leave;