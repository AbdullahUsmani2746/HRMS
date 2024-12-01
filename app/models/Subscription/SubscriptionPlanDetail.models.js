import mongoose from 'mongoose';

const SubscriptionPlanDetailSchema = new mongoose.Schema({
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
  status: {
    type: String,
    required: true,
  },
  grantee: {
    type: String,
    required: true,
  },
});


const SubscriptionPlanDetail = mongoose.models.SubscriptionPlanDetail || mongoose.model('SubscriptionPlanDetail', SubscriptionPlanDetailSchema);
export default SubscriptionPlanDetail;