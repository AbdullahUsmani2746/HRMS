import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import Allownce from '@/models/Employee/allownces.models';

export async function GET() {
  await connectDB();
  try {
    const data = await Allownce.find({});
    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();
    console.log(body.data.length)
    
    // Validate if the request contains at least one location
    if (!body.data || body.data.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one Allownce is required' }, { status: 400 });
    }

    const data = await Allownce.insertMany(body.data);
    return NextResponse.json({ success: true, data: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
