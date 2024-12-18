import { NextResponse } from "next/server";
import connectDB from "@/utils/dbConnect";
import Attendance from "@/models/User/attendance.models";

// Calculate Working Hours (in hours and minutes)
const calculateWorkingHours = (checkInTime, checkOutTime, breakStartTime, breakEndTime) => {
  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);
  const breakStart = breakStartTime ? new Date(breakStartTime) : null;
  const breakEnd = breakEndTime ? new Date(breakEndTime) : null;

  let totalDuration = checkOut - checkIn;

  // Subtract break duration if break is present
  if (breakStart && breakEnd) {
    const breakDuration = breakEnd - breakStart;
    totalDuration -= breakDuration;
  }

  const hours = Math.floor(totalDuration / (1000 * 60 * 60));
  const minutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};

// Handle GET and POST for attendance
export async function GET(req, { params }) {
 const { employeeId } = params;
  await connectDB();

  try {
    const attendance = await Attendance.findOne({
      employeeId: employeeId,
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }, // Only today
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

  const action  = await req.json();

  console.log(action);
  const today = new Date();
  const date = today.toLocaleDateString();

  try {
    let attendance = await Attendance.findOne({
      employeeId: employeeId,
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }, // Check if record exists for today
    });

    if (!attendance) {
      attendance = new Attendance({
        employeeId: employeeId,
        clientId: "CLIENT-001",
        date,
        checkInTime: action.checkInTime,
        
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

export async function PUT(req, { params }) {
    const { employeeId } = params;
    await connectDB();
  
    try {
      const { checkOutTime, totalWorkingHours, breakDuration } = await req.json();
      console.log({ checkOutTime, totalWorkingHours, breakDuration })
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
  
      // Find the attendance record for today
      let attendance = await Attendance.findOne({
        employeeId: employeeId,
        date: { $gte: today },
      });
  
      if (!attendance) {
        // Create a new record if none exists
        attendance = new Attendance({
          checkOutTime: checkOutTime || null,
          totalWorkingHours: totalWorkingHours || null,
          breakDuration: breakDuration || null,
        });
      } else {
        // Update existing record with provided data
        if (checkOutTime) attendance.checkOutTime = checkOutTime;
        if (totalWorkingHours) attendance.totalWorkingHours = totalWorkingHours;
        if (breakDuration) attendance.breakDuration = breakDuration;
      }
  
      // Save the attendance record
      await attendance.save();
  
      return NextResponse.json(
        { message: "Attendance updated successfully.", attendance },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating attendance:", error);
      return NextResponse.json(
        { message: "Error updating attendance data.", error },
        { status: 500 }
      );
    }
  }
  