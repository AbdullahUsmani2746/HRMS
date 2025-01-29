// app/api/allowanceDetails/route.js
import connectDB from '@/utils/dbConnect';
import { NextResponse } from 'next/server';
import PayrollAllownce from '@/models/Payroll/payrollAllownce.models';

// GET: Fetch all allowance details
export async function GET() {
  try {
    await connectDB();
    const allowanceDetails = await PayrollAllownce.find({});
    return NextResponse.json({ success: true, data: allowanceDetails });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// POST: Create a new allowance detail
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const allowanceDetail = await PayrollAllownce.create(body);
    return NextResponse.json({ success: true, data: allowanceDetail }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// PUT: Update an existing allowance detail
export async function PUT(request) {
  try {
    await connectDB();
    const { _id, ...updateData } = await request.json();
    const updatedDetail = await PayrollAllownce.findByIdAndUpdate(_id, updateData, { new: true });
    if (!updatedDetail) {
      return NextResponse.json({ success: false, error: 'Allowance detail not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedDetail });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE: Delete an allowance detail
export async function DELETE(request) {
  try {
    await connectDB();
    const { _id } = await request.json();
    const deletedDetail = await PayrollAllownce.findByIdAndDelete(_id);
    if (!deletedDetail) {
      return NextResponse.json({ success: false, error: 'Allowance detail not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: deletedDetail });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}