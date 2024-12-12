import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import PaySchedule from '@/models/Employee/pay-schedule.models';

export async function GET() {
  await connectDB();
  try {
    const PaySchedules = await PaySchedule.find({});
    return NextResponse.json({ success: true, data: PaySchedules });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();
    
    // Validate if the request contains at least one location
    if (!body.data || body.data.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one PaySchedule is required' }, { status: 400 });
    }

    const PaySchedules = await PaySchedule.insertMany(body.data);
    return NextResponse.json({ success: true, data: PaySchedules }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
