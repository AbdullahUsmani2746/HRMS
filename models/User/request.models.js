import mongoose from "mongoose" ;

// models/Request.js
const requestSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['leave', 'attendance'],
      required: [true, 'Request type is required']
    },
    employerId: {
        type: String,
        required: [true, 'Employer reference is required']
      },
    employeeId: {
      type: String,
      required: [true, 'Employee reference is required']
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true
    },
    // Fields for leave requests
    leaveType: {
      type: String,
      required: function() { return this.type === 'leave'; }
    },
    startDate: {
      type: Date,
      required: function() { return this.type === 'leave'; }
    },
    endDate: {
      type: Date,
      required: function() { return this.type === 'leave'; }
    },
    // // Fields for attendance requests
    // date: {
    //   type: Date,
    //   required: function() { return this.type === 'attendance'; }
    // },
    checkIn: {
      type: String,
      required: function() { return this.type === 'attendance'; }
    },
    checkOut: {
      type: String,
      required: function() { return this.type === 'attendance'; }
    }
  }, {
    timestamps: true,
    // discriminatorKey: 'type'
  });
  
  // Add virtual field for duration (leave requests)
//   requestSchema.virtual('duration').get(function() {
//     if (this.type === 'leave' && this.startDate && this.endDate) {
//       const diffTime = Math.abs(this.endDate - this.startDate);
//       return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end dates
//     }
//     return null;
//   });
  
 const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);
 export default Request;