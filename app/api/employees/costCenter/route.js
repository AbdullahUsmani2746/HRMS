import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import CostCenter from '@/models/Employee/cost-center.models';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const employerId = searchParams.get('employerId')  
  await connectDB();
  try {
    const costCenters = await CostCenter.find({employerId:employerId});
    return NextResponse.json({ success: true, data: costCenters });
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
      return NextResponse.json({ success: false, error: 'At least one CostCenter is required' }, { status: 400 });
    }

    const costCenters = await CostCenter.insertMany(body.data);
    return NextResponse.json({ success: true, data: costCenters }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
