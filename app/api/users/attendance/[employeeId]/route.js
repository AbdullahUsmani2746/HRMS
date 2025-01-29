// import { NextResponse } from "next/server";
// import connectDB from "@/utils/dbConnect";
// import Attendance from "@/models/User/attendance.models";
// import { ObjectId } from "bson";

// export async function GET(req, { params }) {
//   const { employeeId } = params;
//   console.log(employeeId)
//   await connectDB();

//   try {
//     const attendance = await Attendance.find({
//       employeeId: employeeId
//     });

//     if (!attendance) {
//       return NextResponse.json(
//         { message: "No attendance data found for today." },
//         { status: 200 }
//       );
//     }

//     return NextResponse.json(attendance);
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Error fetching attendance data.", error },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req, { params }) {
//   const { employeeId } = params;
//   await connectDB();

//   const action = await req.json();
//   const today = new Date();
//   const date = today.toLocaleDateString();

//   try {
//     let attendance = await Attendance.findOne({
//       employeeId: employeeId,
//       date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }, // Check if record exists for today
//     });

//     if (!attendance) {
//       // Create a new attendance record
//       attendance = new Attendance({
//         employeeId: employeeId,
//         clientId: "CLIENT-001",
//         date,
//         checkInTime: action.checkInTime,
//         checkOutTime: action.checkOutTime,
//         breakDuration: action.breakDuration,
//         totalWorkingHours: action.totalWorkingHours,
//         status: "Pending", // Default status
//       });
//     } 
      
    

//     // Save the attendance record
//     await attendance.save();

//     return NextResponse.json(attendance);
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Error updating attendance data.", error },
//       { status: 500 }
//     );
//   }
// }



// export async function PUT(req, { params }) {
//   const attendanceId  = params.employeeId;

//   console.log(params.employeeId)
//   await connectDB();

//   try {
//     const  {newStatus}  = await req.json();

//     console.log(newStatus)


//     // Find and update the attendance record by ID
//     const updatedAttendance = await Attendance.findByIdAndUpdate(
//       new ObjectId(attendanceId),
//       { status: newStatus},
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


import { NextResponse } from "next/server";
import connectDB from "@/utils/dbConnect";
import Attendance from "@/models/User/attendance.models"; // Ensure the model path is correct
import { ObjectId } from "mongodb"; // Use mongodb's ObjectId

// Connect to the database
await connectDB();

/**
 * GET method to fetch attendance records for an employee
 * @param {Object} req - The request object
 * @param {Object} params - The request parameters
 * @returns {Object} - Attendance data for the employee
 */
export async function GET(req, { params }) {
  const { employeeId } = params;

  try {
    const attendance = await Attendance.find({ employeeId }).sort({ date: -1 }); // Fetch attendance sorted by date

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

/**
 * POST method to create a new attendance record
 * @param {Object} req - The request object
 * @returns {Object} - The created attendance record
 */
export async function POST(req) {
  const body = await req.json();

  try {
    const newAttendance = await Attendance.create(body);

    return NextResponse.json(newAttendance, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create attendance record.", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT method to update an existing attendance record
 * @param {Object} req - The request object
 * @returns {Object} - The updated attendance record
 */
export async function PUT(req, {params}) {
  const body = await req.json();
  const { _id  } = body;

  if (!_id) {
    return NextResponse.json(
      { message: "Attendance ID is required for updating records." },
      { status: 400 }
    );
  }

  try {
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      _id,
      body,
      { new: true }
    );

    if (!updatedAttendance) {
      return NextResponse.json(
        { message: "Attendance record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAttendance, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update attendance record.", error: error.message },
      { status: 500 }
    );
  }
}

