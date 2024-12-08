import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import Application from '@/models/Subscription/Applications.models';
import { ObjectId } from 'bson';

export async function DELETE(request,value) {
    await connectDB();
    try {
    // Extract the ID from the URL path
    const id = value.params.id// Get the last part of the path, which is the ID
    console.log(id)
      const deletedApplication = await Application.findByIdAndDelete(new ObjectId(id));
      if (!deletedApplication) {
        return NextResponse.json(
          { message: `Application not found ${id}` },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { message: "Application deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting Application:", error);
      return NextResponse.json(
        { message: "Server error", error: error.message },
        { status: 500 }
      );
    }
  }
  