import { NextResponse } from 'next/server';
import connectDB from '@/app/utils/dbConnect';
import Employer from '@/app/models/employer.models';

export async function GET() {
  await connectDB();
  try {
    const employers = await Employer.find({});
    return NextResponse.json({ message: "Employers fetched From the Database", data: employers });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();
    const employer = new Employer(body);
    console.log("Employer", employer);

    // Save the document in MongoDB
    await employer.save();
    return NextResponse.json({ message: "Employer added to the Database", data: employer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: `Employer Not Added ${error.message}` }, { status: 400 });
  }
}
