import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import Employee from '@/models/employee.models';

export async function GET() {
  await connectDB();
  try {
    const employers = await Employee.find({});
    return NextResponse.json({ message: "Employers fetched From the Database", data: employers });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();
    const employer = new Employee(body);
    console.log("Employer", employer);

    // Save the document in MongoDB
    await employer.save();
    return NextResponse.json({ message: "Employer added to the Database", data: employer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: `Employer Not Added ${error.message}` }, { status: 400 });
  }
}
