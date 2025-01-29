import connectDB from '@/utils/dbConnect';
import  PayrollProcess  from "@/models/Payroll/payrollProcess.models"; // Adjust the path to your model
import { NextResponse } from "next/server";

export async function GET(request,value) {
    try {

        const id = value.params.id// Get the last part of the path, which is the ID


      await connectDB();
  
      // Fetch all payroll processes
      const payroll = await PayrollProcess.findOne({_id: id});  
      // Return success response
      return NextResponse.json({ success: true, data: payroll }, { status: 200 });
    } catch (error) {
      // Handle error response
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }


export async function DELETE(request, value) {
  await connectDB();

  try {
    // Extract the ID from the URL path
    const id = value.params.id; // Get the ID from params
    console.log(`Deleting PayrollProcess with ID: ${id}`);

    // Attempt to delete the record from the PayrollProcess collection
    const deletedPayroll = await PayrollProcess.findByIdAndDelete(id);

    if (!deletedPayroll) {
      return NextResponse.json(
        { message: `PayrollProcess not found for ID: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "PayrollProcess deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting PayrollProcess:", error);

    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
