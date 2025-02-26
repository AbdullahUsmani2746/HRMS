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

    balance: {
        type: Number,
        default: 0
      },

      maxCarryForward: {
        type: Number,
        default: 15 // Default maximum 15 days carry forward for any leave type
      },

      lastUpdated: {
        type: Date,
        default: Date.now
      },

    employerId:{
        type: String,
        required: true,
        maxlength: 12
      }
})

const Leave = mongoose.model.Leave || mongoose.model('Leave', LeaveSchema);
export default Leave;