import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import Department from '@/models/Employee/department.models';
import { ObjectId } from 'bson';

export async function DELETE(request,value) {
    await connectDB();
    try {
    // Extract the ID from the URL path
    const id = value.params.id// Get the last part of the path, which is the ID
    console.log(id)
      const deletedApplication = await Department.findByIdAndDelete(new ObjectId(id));
      if (!deletedApplication) {
        return NextResponse.json(
          { message: `Department not found ${id}` },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { message: "Department deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting Department:", error);
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
      const updatedData = await Department.findByIdAndUpdate(new ObjectId(id), data, {
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
        { message: "Department updated successfully", data: updatedData },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating Department:", error);
      return NextResponse.json(
        { message: "Server error", error: error.message },
        { status: 500 }
      );
    }
  }