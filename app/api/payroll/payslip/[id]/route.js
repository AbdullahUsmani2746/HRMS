import connectDB from "@/utils/dbConnect"; // Import database connection utility
import Payslip from "@/models/Payroll/payslip.models"; // Import the Payslip model

import { NextResponse } from 'next/server'; // Make sure to import NextResponse

// GET and POST handler for Payslip
export async function GET(req, { params }) {
  const { id } = await params;
    
  await connectDB(); // Connect to the database

  try {
    const payslips = await Payslip.find({ employeeId: id }); // Retrieve all payslips
    return NextResponse.json(payslips, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching payslips", error }, { status: 500 });
  }
}
