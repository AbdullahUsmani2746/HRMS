import { NextResponse } from 'next/server';
import SubscriptionPlanApplication from '@/app/models/Subscription/SubscriptionPlanApplications.models';
import connectDB from '@/app/utils/dbConnect';

export async function GET() {
  await connectDB();
  try {
    const applications = await SubscriptionPlanApplication.find({});
    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();
    
    // Validate the incoming data
    if (!body.planId || !Array.isArray(body.applicationIds) || body.applicationIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 400 });
    }

    // Create subscription plan applications for each applicationId
    const applications = body.applicationIds.map(applicationId => ({
      planId: body.planId,
      applicationId
    }));

    const application = await SubscriptionPlanApplication.insertMany(applications);
    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
