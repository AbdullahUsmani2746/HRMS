import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import EmployeePayrollMaster from '@/models/Payroll/employeePayrollMaster.models';



// POST: Create a new payroll record
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Ensure required fields are present
    const newPayroll = new EmployeePayrollMaster(body);
    const savedPayroll = await newPayroll.save();

    return NextResponse.json({ success: true, data: savedPayroll }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET: Fetch all payroll records
export async function GET(request) {
  try {
    await connectDB();
    const payrolls = await EmployeePayrollMaster.find();
    return NextResponse.json({ success: true, data: payrolls }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Update a payroll record by ID
export async function PATCH(request) {
  try {
    await connectDB();
    const { id } = await request.json();
    const body = await request.json();

    const updatedPayroll = await EmployeePayrollMaster.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updatedPayroll) {
      return NextResponse.json({ success: false, message: 'Payroll record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedPayroll }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a payroll record by ID
export async function DELETE(request) {
  try {
    await connectDB();
    const { id } = await request.json();

    const deletedPayroll = await EmployeePayrollMaster.findByIdAndDelete(id);

    if (!deletedPayroll) {
      return NextResponse.json({ success: false, message: 'Payroll record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deletedPayroll }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
