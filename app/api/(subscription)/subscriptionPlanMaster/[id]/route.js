// pages/api/SubscriptionPlanMaster/[id].js

import { NextResponse } from "next/server";
import connectDB from "@/utils/dbConnect";
import SubscriptionPlanMaster from '@/models/Subscription/SubscriptionPlanMaster.models';
import { ObjectId } from "bson";

// Update SubscriptionPlanMaster
export async function PUT(request, { params }) {
  await connectDB();
  try {
    // Extract the ID from the URL path
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop(); // Get the last part of the path, which is the ID

    console.log(id);

    // Parse the request body
    const data = await request.json();

    // Update the SubscriptionPlanMaster by ID
    const updatedSubscriptionPlanMaster = await SubscriptionPlanMaster.findByIdAndUpdate(new ObjectId(id), data, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators during update
    });

    if (!updatedSubscriptionPlanMaster) {
      return NextResponse.json(
        { message: "Plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Plan updated successfully", SubscriptionPlanMaster: updatedSubscriptionPlanMaster },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating Plan:", error);
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
    const deletedSubscriptionPlanMaster = await SubscriptionPlanMaster.findByIdAndDelete(new ObjectId(id));
    if (!deletedSubscriptionPlanMaster) {
      return NextResponse.json(
        { message: `Plan not found ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Plan deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting Plan:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
