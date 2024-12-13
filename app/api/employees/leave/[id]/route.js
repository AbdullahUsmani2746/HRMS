import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import Leave from '@/models/Employee/leaves.models';
import { ObjectId } from 'bson';

export async function DELETE(request,value) {
    await connectDB();
    try {
    // Extract the ID from the URL path
    const id = value.params.id// Get the last part of the path, which is the ID
    console.log(id)
      const deletedData = await Leave.findByIdAndDelete(new ObjectId(id));
      if (!deletedData) {
        return NextResponse.json(
          { message: `Leave not found ${id}` },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { message: "Leave deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting Leave:", error);
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
      const updatedData = await Leave.findByIdAndUpdate(new ObjectId(id), data, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators during update
      });
  
      if (!updatedData) {
        return NextResponse.json(
          { message: "Leave not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { message: "Leave updated successfully", data: updatedData },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating Leave:", error);
      return NextResponse.json(
        { message: "Server error", error: error.message },
        { status: 500 }
      );
    }
  }