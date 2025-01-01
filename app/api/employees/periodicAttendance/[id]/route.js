import { NextResponse } from "next/server";
import connectDB from "@/utils/dbConnect";
import PeriodicAttendance from "@/models/Employee/periodic-attendance.models";
import { ObjectId } from "bson";

export async function PUT(req, { params }) {
    const attendanceId  = params.id;
  
    console.log(params.employeeId)
    await connectDB();
  
    try {
      const  {newStatus}  = await req.json();
  
      console.log(newStatus)
  
  
      // Find and update the attendance record by ID
      const updatedAttendance = await PeriodicAttendance.findByIdAndUpdate(
        new ObjectId(attendanceId),
        { status: newStatus},
        { new: true } // Return the updated document
      );
  
      if (!updatedAttendance) {
        return NextResponse.json(
          { message: "Attendance record not found." },
          { status: 404 }
        );
      }
  
      return NextResponse.json(updatedAttendance);
    } catch (error) {
      return NextResponse.json(
        { message: "Error updating attendance record.", error },
        { status: 500 }
      );
    }
  }