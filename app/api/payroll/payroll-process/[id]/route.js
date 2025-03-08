import connectDB from '@/utils/dbConnect';
import  PayrollProcess  from "@/models/Payroll/payrollProcess.models"; // Adjust the path to your model
import { NextResponse } from "next/server";

export async function GET(request,value) {
    try {

        const id = value.params.id// Get the last part of the path, which is the ID


      await connectDB();
  
      // Fetch all payroll processes
      const payroll = await PayrollProcess.findOne({payroll_id: id}) ; 
      // || await PayrollProcess.findOne({payroll_id: id});  
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

export async function PUT(request, context){
  try {
    await connectDB();
    const payrollId = context.params.id;
    const { employeeIds, amounts } = await request.json();

    if (!employeeIds?.length || !Array.isArray(employeeIds)) {
      return NextResponse.json(
        { success: false, error: "Invalid employee data" },
        { status: 400 }
      );
    }

    // Get existing payroll data
    const existingPayroll = await PayrollProcess.findOne({
      payroll_id: payrollId,
    });

    if (!existingPayroll) {
      return NextResponse.json(
        { success: false, error: "Payroll not found" },
        { status: 404 }
      );
    }

    // Calculate total approved amount for this batch
    const batchAmount = amounts.reduce((acc, curr) => acc + curr, 0);
    
    // Update payroll document
    const updatedPayroll = await PayrollProcess.findOneAndUpdate(
      { payroll_id: payrollId },
      {
        $addToSet: { processedEmployees: { $each: employeeIds } },
        $inc: { totalAmount: batchAmount },
        $set: {
          status: existingPayroll.processedEmployees.length + employeeIds.length >= existingPayroll.totalEmployees
            ? "Approved"
            : "Partially Approved"
        }
      },
      { new: true }
    );

    return NextResponse.json(
      { 
        success: true, 
        data: updatedPayroll,
        message: `Approved ${employeeIds.length} employees successfully`
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Payroll approval error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

