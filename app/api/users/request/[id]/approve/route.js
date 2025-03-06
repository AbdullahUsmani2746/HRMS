// File: app/api/users/requests/[requestId]/approve/route.js
import { NextResponse } from "next/server";
import Request from "@/models/User/request.models"; // Adjust import path as needed
import connectDB from '@/utils/dbConnect';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // Find the request by ID
    const existingRequest = await Request.findById(id);
    
    if (!existingRequest) {
      return NextResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }
    
    // Update the request status to approved
    existingRequest.status = "Approved";
    // existingRequest.approvedAt = new Date();
    // existingRequest.updatedAt = new Date();
    
    // Save the updated request
    const updatedRequest = await existingRequest.save();

    return NextResponse.json({ 
      data: updatedRequest,
      message: "Request approved successfully" 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error approving request:", error);
    return NextResponse.json(
      { message: "Failed to approve request", error: error.message },
      { status: 500 }
    );
  }
}