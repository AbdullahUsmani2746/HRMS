// pages/api/employers/[id].js

import { NextResponse } from "next/server";
import connectDB from "@/utils/dbConnect";
import Employer from "@/models/employer.models";
import { ObjectId } from "bson";

// Update Employer
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
    const updatedEmployer = await Employer.findByIdAndUpdate(new ObjectId(id), data, {
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

export async function DELETE(request) {
  await connectDB();
  try {
  // Extract the ID from the URL path
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop(); // Get the last part of the path, which is the ID
  console.log(id)
    const deletedEmployer = await Employer.findByIdAndDelete(new ObjectId(id));
    if (!deletedEmployer) {
      return NextResponse.json(
        { message: `Employer not found ${id}` },
        { status: 404 }
      );
    }

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
