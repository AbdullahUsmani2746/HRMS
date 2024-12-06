import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import Application from '@/models/Subscription/Applications.models';

export async function GET() {
  await connectDB();
  try {
    const applications = await Application.find({});
    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();
    
    // Validate if the request contains at least one application
    if (!body.applications || body.applications.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one application is required' }, { status: 400 });
    }

    const applications = await Application.insertMany(body.applications);
    return NextResponse.json({ success: true, data: applications }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
