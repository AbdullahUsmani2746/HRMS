import connectDB from '@/utils/dbConnect';
import Attendance from '@/models/User/attendance.models';
import { NextResponse } from "next/server";

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams
    const employerId = searchParams.get('employerId') 

    await connectDB();

  try {
    const attendance = await Attendance.find({ clientId: employerId }); // Fetch attendance sorted by date

    if (!attendance || attendance.length === 0) {
      return NextResponse.json(
        { message: "No attendance records found." },
        { status: 404 }
      );
    }

    return NextResponse.json(attendance, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch attendance records.", error: error.message },
      { status: 500 }
    );
  }
}