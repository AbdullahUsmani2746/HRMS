import mongoose from 'mongoose';

const SubscriptionPlanApplicationSchema = new mongoose.Schema({
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlanMaster',
    required: true,
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
  },
});

const SubscriptionPlanApplication = mongoose.models.SubscriptionPlanApplication || mongoose.model('SubscriptionPlanApplication', SubscriptionPlanApplicationSchema);
export default SubscriptionPlanApplication;


