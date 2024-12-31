import { NextResponse } from "next/server";
import connectDB from "@/utils/dbConnect";
import PeriodicAttendance from "@/models/Employee/periodic-attendance.models";
import { ObjectId } from "bson";

// GET Attendance Records
export async function GET(req) {
  // const { searchParams } = new URL(req.url);
  // const employeeId = searchParams.get("employeeId");
  // const startDate = new Date(searchParams.get("startDate"));
  // const endDate = new Date(searchParams.get("endDate"));

  await connectDB();

  try {
    // const query = {
    //   employeeId,
    //   date: { $gte: startDate, $lte: endDate },
    // };

    const attendance = await PeriodicAttendance.find();

    if (!attendance.length) {
      return NextResponse.json(
        { message: "No attendance data found for the specified range." },
        { status: 200 }
      );
    }

    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching attendance data.", error },
      { status: 500 }
    );
  }
}

// POST Attendance Record (Insert or Update Single Record)
export async function POST(req) {
  await connectDB();

  try {
    const record = await req.json();
    console.log(record);

    if (!record || !record.employeeId || !record.dateRange) {
      return NextResponse.json(
        { message: "Invalid data. 'employeeId' and 'date' are required." },
        { status: 400 }
      );
    }

    const newRecord = await PeriodicAttendance.create(record);

    return NextResponse.json({
      message: "Attendance data saved successfully.",
      data: newRecord,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error saving attendance data.", error },
      { status: 500 }
    );
  }
}

// PUT Update Attendance Record by ID
// export async function PUT(req, { params }) {
//   const attendanceId = params.employeeId;

//   await connectDB();

//   try {
//     const { newStatus } = await req.json();

//     // Find and update the attendance record by ID
//     const updatedAttendance = await PeriodicAttendance.findByIdAndUpdate(
//       new ObjectId(attendanceId),
//       { status: newStatus },
//       { new: true } // Return the updated document
//     );

//     if (!updatedAttendance) {
//       return NextResponse.json(
//         { message: "Attendance record not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(updatedAttendance);
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Error updating attendance record.", error },
//       { status: 500 }
//     );
//   }
// }
