import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import Department from '@/models/Employee/department.models';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const employerId = searchParams.get('employerId') 
  await connectDB();
  try {
    const departments = await Department.find({employerId: employerId});
    return NextResponse.json({ success: true, data: departments });
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
      return NextResponse.json({ success: false, error: 'At least one Department is required' }, { status: 400 });
    }

    const departments = await Department.insertMany(body.data);
    return NextResponse.json({ success: true, data: departments }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
