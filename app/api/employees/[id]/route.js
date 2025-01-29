// pages/api/employers/[id].js

import { NextResponse } from "next/server";
import connectDB from "@/utils/dbConnect";
import Employee from "@/models/Employee/employee.models";
import { ObjectId } from "bson";
import User from "@/models/user.models";


export async function GET(req, { params }) {
  const { id } = await params;
  console.log(id)
  console.log("ID A")

  await connectDB();

  try {
    const employee = await Employee.find({employeeId: id});
  console.log(employee )


    if (!employee) {
      return NextResponse.json(
        { message: "No Employee data found for today." },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: "Employers fetched From the Database", data:`${employee[0].firstName} ${employee[0].surname} ` });

  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching data.", error },
      { status: 500 }
    );
  }
}

// Update Employee
export async function PUT(request, { params }) {
  await connectDB();
  try {
    // Extract the ID from the URL path
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop(); // Get the last part of the path, which is the ID

    console.log(id);

    // Parse the request body
    const data = await request.json();

    // Update the employer by ID
    const updatedEmployer = await Employee.findByIdAndUpdate(new ObjectId(id), data, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators during update
    });

    if (!updatedEmployer) {
      return NextResponse.json(
        { message: "Employer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Employer updated successfully", employer: updatedEmployer },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating employer:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request,value) {
  await connectDB();
  try {
  // Extract the ID from the URL path
  const id = value.params.id
  console.log(id)
   
    // Find the employer to get the email or username before deleting
    const employerToDelete = await Employee.findById(id);

    if (!employerToDelete) {
      return NextResponse.json(
        { message: `Employer not found with ID: ${id}` },
        { status: 404 }
      );
    }

    // Delete the Employer
    const deletedEmployer = await Employee.findByIdAndDelete(new ObjectId(id));
    console.log("Deleted Employer:", deletedEmployer);

    // Delete the corresponding User using their email (or another unique field)
    const deletedUser = await User.findOneAndDelete({ email: employerToDelete.email });
    console.log("Deleted User:", deletedUser);

    return NextResponse.json(
      { message: "Employer deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting employer:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
