import { NextResponse } from 'next/server';
import SubscriptionPlanApplication from '@/models/Subscription/SubscriptionPlanApplications.models';
import connectDB from '@/utils/dbConnect';
import { ObjectId } from "bson";


export async function GET(request) {
  await connectDB();
  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    console.log(planId);

    // Query the database
    let applications = [];

    if (planId) {
      // Fetch records where the planId field matches the provided planId
      applications = await SubscriptionPlanApplication.find({ planId });
    } else {
      // If no planId is provided, fetch all records
      applications = await SubscriptionPlanApplication.find({});
    }

    console.log(applications);

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

