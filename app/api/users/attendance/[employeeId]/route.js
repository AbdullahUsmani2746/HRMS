import { NextResponse } from "next/server";
import connectDB from "@/utils/dbConnect";
import Attendance from "@/models/User/attendance.models";

export async function GET(req, { params }) {
  const { employeeId } = params;
  console.log(employeeId)
  await connectDB();

  try {
    const attendance = await Attendance.find({
      employeeId: employeeId
    });

    if (!attendance) {
      return NextResponse.json(
        { message: "No attendance data found for today." },
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

export async function POST(req, { params }) {
  const { employeeId } = params;
  await connectDB();

  const action = await req.json();
  const today = new Date();
  const date = today.toLocaleDateString();

  try {
    let attendance = await Attendance.findOne({
      employeeId: employeeId,
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }, // Check if record exists for today
    });

    if (!attendance) {
      // Create a new attendance record
      attendance = new Attendance({
        employeeId: employeeId,
        clientId: "CLIENT-001",
        date,
        checkInTime: action.checkInTime,
        checkOutTime: action.checkOutTime,
        breakDuration: action.breakDuration,
        totalWorkingHours: action.totalWorkingHours,
        status: "Pending", // Default status
      });
    } 
      
    

    // Save the attendance record
    await attendance.save();

    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating attendance data.", error },
      { status: 500 }
    );
  }
}
