import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  answers: { type: String },
  status: { type: String, default: "To-Do " },
  rejectionReason: {
    type: String,
    required: function () {
      return this.status === "Rejected";
    },
  },

});

const TicketSchema = new mongoose.Schema({
  complaintNumber: { type: String, required: true, unique: true },
  employeeId: { type: String },
  employerId: { type: String },
  isAdmin: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  questions: [QuestionSchema],
  status: { type: String, default: "open" },
});

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
