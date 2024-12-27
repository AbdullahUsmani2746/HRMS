import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import Manager from '@/models/Employee/manager.models';
import Department from '@/models/Employee/department.models';

export async function GET(request) {
  await connectDB();
  const searchParams = request.nextUrl.searchParams
  const ID = searchParams.get('employeeId') 
  try {
    const data = await Manager.find({employeeId:ID});
    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
