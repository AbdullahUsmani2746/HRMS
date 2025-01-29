import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import Employer from '@/models/employer.models';
import User from '@/models/user.models';

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

     // Create a User for this Employer
     const newUser = new User({
      username: employer.employerId, // Assuming username exists in the Employer body
      email: employer.email, // Assuming email exists in the Employer body
      password: "admin", // You can generate a secure default password or use a random generator
      role: "Admin", // You can adjust the role if needed
    });

    // Save the User in MongoDB
    await newUser.save();
    return NextResponse.json({ message: "Employer added to the Database", data: employer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: `Employer Not Added ${error.message}` }, { status: 400 });
  }
}
