import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import WorkLocation from '@/models/Employee/work-location.models';
import { ObjectId } from 'bson';

export async function DELETE(request,value) {
    await connectDB();
    try {
    // Extract the ID from the URL path
    const id = value.params.id// Get the last part of the path, which is the ID
    console.log(id)
      const deletedApplication = await WorkLocation.findByIdAndDelete(new ObjectId(id));
      if (!deletedApplication) {
        return NextResponse.json(
          { message: `WorkLocation not found ${id}` },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { message: "WorkLocation deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting WorkLocation:", error);
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
      const updatedWorkLocation = await WorkLocation.findByIdAndUpdate(new ObjectId(id), data, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators during update
      });
  
      if (!updatedWorkLocation) {
        return NextResponse.json(
          { message: "Employer not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { message: "WorkLocation updated successfully", location: updatedWorkLocation },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating WorkLocation:", error);
      return NextResponse.json(
        { message: "Server error", error: error.message },
        { status: 500 }
      );
    }
  }