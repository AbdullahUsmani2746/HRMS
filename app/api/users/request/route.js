import connectDB from '@/utils/dbConnect';
import Request from '@/models/User/request.models';
import { NextResponse } from "next/server";

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams
    const employerId = searchParams.get('employerId') 

    await connectDB();

  try {
    const request = await Request.find({ employerId: employerId }); // Fetch attendance sorted by date

    if (!request || request.length === 0) {
      return NextResponse.json(
        { message: "No Request records found." },
        { status: 404 }
      );
    }

    return NextResponse.json(request, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch Request records.", error: error.message },
      { status: 500 }
    );
  }
}

