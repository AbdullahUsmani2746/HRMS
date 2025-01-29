// app/api/allowanceDetails/route.js
import connectDB from '@/utils/dbConnect';
import { NextResponse } from 'next/server';
import PayrollAllownce from '@/models/Payroll/payrollAllownce.models';

// GET: Fetch Single allowance details
export async function GET(request, {params}) {
    try {
      const id = await params.id
      await connectDB();
      const allowanceDetails = await PayrollAllownce.find({payroll_id: id});
      return NextResponse.json({ success: true, data: allowanceDetails });
    } catch (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }