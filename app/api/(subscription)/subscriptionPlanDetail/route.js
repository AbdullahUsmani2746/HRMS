import { NextResponse } from 'next/server';
import SubscriptionPlanDetail from '@/models/Subscription/SubscriptionPlanDetail.models';
import connectDB from '@/utils/dbConnect';

export async function GET() {
  await connectDB();
  try {
    const details = await SubscriptionPlanDetail.find({});
    return NextResponse.json({ success: true, data: details });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();
    const detail = await SubscriptionPlanDetail.create(body);
    return NextResponse.json({ success: true, data: detail }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}


