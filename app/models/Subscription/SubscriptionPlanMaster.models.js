import mongoose from "mongoose";

const subscriptionPlanMasterSchema = new mongoose.Schema({
  planName: { type: String, required: true },
  subscriptionFee: { type: Number, required: true }
});

const SubscriptionPlanMaster = mongoose.models.SubscriptionPlanMaster || mongoose.model('SubscriptionPlanMaster', subscriptionPlanMasterSchema);
export default SubscriptionPlanMaster;
