import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import Manager from '@/models/Employee/manager.models';
import Department from '@/models/Employee/department.models';
import User from '@/models/user.models';

export async function GET(request) {
  await connectDB();
  const searchParams = request.nextUrl.searchParams
  const employerId = searchParams.get('employerId') 
  try {
    const data = await Manager.find({clientId:employerId})
    .populate('departmentId')
    .populate('employeeId');  // Populate employeeId

    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();
    // console.log(body.data.length)
    
    console.log(body.length)
    // Validate if the request contains at least one location
    if (!body.data || body.data.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one Manager is required' }, { status: 400 });
    }

    const data = await Manager.insertMany(body.data);

// Update the corresponding users to set isManager to true
const employeeIds = body.data.map(manager => manager.employeeId); // Extract employeeIds from the request body

// Update users where employeeId matches the ones in the manager data
await User.updateMany(
  { username: { $in: employeeIds } }, // Find users with employeeIds from the manager data
  { $set: { isManager: true } } // Set isManager to true
);


    return NextResponse.json({ success: true, data: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
