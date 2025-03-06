import connectDB from '@/utils/dbConnect';
import Request from '@/models/User/request.models';
import { NextResponse } from "next/server";

export async function GET(request,{params}) {

    await connectDB();
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type');
    const employeeId = await params.id


  try {
    const request = await Request.find({ employeeId: employeeId , type: type }); // Fetch attendance sorted by date

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

export async function POST(request) {
    const body = await request.json();
 
   try {
     const requestBody = await Request.create(body);
 
     return NextResponse.json({ data: requestBody ,status: 201 });
   } catch (error) {
     return NextResponse.json(
       { message: "Failed to create request record.", error: error.message },
       { status: 500 }
     );
   }
}

