import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import JobTitle from '@/models/Employee/job_title.models';
import { ObjectId } from 'bson';

export async function DELETE(request,value) {
    await connectDB();
    try {
    // Extract the ID from the URL path
    const id = value.params.id// Get the last part of the path, which is the ID
    console.log(id)
      const deletedData = await JobTitle.findByIdAndDelete(new ObjectId(id));
      if (!deletedData) {
        return NextResponse.json(
          { message: `JobTitle not found ${id}` },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { message: "JobTitle deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting JobTitle:", error);
      return NextResponse.json(
        { message: "Server error", error: error.message },
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
      const updatedData = await JobTitle.findByIdAndUpdate(new ObjectId(id), data, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators during update
      });
  
      if (!updatedData) {
        return NextResponse.json(
          { message: "Department not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { message: "JobTitle updated successfully", data: updatedData },
        { status: 200 }
      );
    } catch (error) {
      console.error("JobTitle updating Department:", error);
      return NextResponse.json(
        { message: "Server error", error: error.message },
        { status: 500 }
      );
    }
  }