import mongoose from "mongoose";

const applicationsSchema = new mongoose.Schema({
  applicationName: { type: String, required: true },
  details: { type: String, required:true }
});
const Application = mongoose.models.Application || mongoose.model('Application', applicationsSchema);
export default Application;
