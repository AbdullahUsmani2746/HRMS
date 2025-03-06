// File: app/api/manager/requests/[id]/reject/route.js
import { NextResponse } from "next/server";
import Request  from "@/models/User/request.models"; // Adjust import path as needed
import connectDB from '@/utils/dbConnect';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    const { reason } = body;
    
    // Find the request by ID
    const existingRequest = await Request.findById(id);
    
    if (!existingRequest) {
      return NextResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }
    
    // Update the request status to rejected
    existingRequest.status = "Rejected";
    existingRequest.rejectionReason = reason;
    // existingRequest.rejectedAt = new Date();
    // existingRequest.updatedAt = new Date();
    
    // Save the updated request
    const updatedRequest = await existingRequest.save();

    return NextResponse.json({ 
      data: updatedRequest,
      message: "Request rejected successfully" 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error rejecting request:", error);
    return NextResponse.json(
      { message: "Failed to reject request", error: error.message },
      { status: 500 }
    );
  }
}