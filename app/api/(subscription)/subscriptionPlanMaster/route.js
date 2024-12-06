import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import SubscriptionPlanMaster from '@/models/Subscription/SubscriptionPlanMaster.models';

export async function GET() {
  await connectDB();
  try {
    const plans = await SubscriptionPlanMaster.find({});
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();
    const plan = await SubscriptionPlanMaster.create(body);
    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
