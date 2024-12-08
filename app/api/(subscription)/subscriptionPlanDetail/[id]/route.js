// pages/api/SubscriptionPlanDetail/[id].js

import { NextResponse } from "next/server";
import connectDB from "@/utils/dbConnect";
import SubscriptionPlanDetail from '@/models/Subscription/SubscriptionPlanDetail.models';
import { ObjectId } from "bson";

// Update SubscriptionPlanDetail
export async function PUT(request, value) {
  await connectDB();

  try {
    // Extract planId from params
    const planId  = value.params.id;

    // Parse the request body
    const detailsToUpdate = await request.json();

    // Ensure the planId is valid
    if (!planId) {
      return NextResponse.json(
        { message: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Fetch existing plan details
    const existingDetails = await SubscriptionPlanDetail.find({ planId });

    // Prepare a map for fast lookup of existing details
    const existingDetailsMap = new Map(
      existingDetails.map((detail) => [`${detail.grantee}-${detail.applicationId}`, detail])
    );

    // Prepare a set of keys from the detailsToUpdate for comparison
    const detailsToUpdateKeys = new Set(
      detailsToUpdate.map((detail) => `${detail.grantee}-${detail.applicationId}`)
    );

    // Identify keys to delete (existing entries that are not in detailsToUpdate)
    const keysToDelete = [...existingDetailsMap.keys()].filter(
      (key) => !detailsToUpdateKeys.has(key)
    );

    // Create the bulk operations (update, insert, delete)
    const bulkOperations = detailsToUpdate.map((detail) => {
      const key = `${detail.grantee}-${detail.applicationId}`;
      if (existingDetailsMap.has(key)) {
        // Update operation for existing entry
        return {
          updateOne: {
            filter: { _id: existingDetailsMap.get(key)._id },
            update: { $set: { status: detail.status } },
          },
        };
      } else {
        // Insert operation for new entry
        return {
          insertOne: {
            document: {
              ...detail,
              planId,
            },
          },
        };
      }
    });

    // Add delete operations for the entries that are not in detailsToUpdate
    const deleteOperations = keysToDelete.map((key) => {
      const existingDetail = existingDetailsMap.get(key);
      return {
        deleteOne: {
          filter: { _id: existingDetail._id },
        },
      };
    });

    // Combine all operations (insert, update, delete)
    const allOperations = [...bulkOperations, ...deleteOperations];

    // Perform the bulk operation (insert, update, and delete combined)
    const result = await SubscriptionPlanDetail.bulkWrite(allOperations);

    return NextResponse.json(
      {
        message: "SubscriptionPlanDetail updated successfully",
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating SubscriptionPlanDetail:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}



export async function DELETE(request,value) {
  await connectDB();
  try {
 // Extract query parameters from the request URL
 const planId = value.params.id
 console.log(planId);
    const deletedSubscriptionPlanDetail = await SubscriptionPlanDetail.deleteMany({planId});
    if (deletedSubscriptionPlanDetail.deletedCount === 0) {
      return NextResponse.json(
        { message: `SubscriptionPlanDetail not found  ` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: `Successfully deleted ${deletedSubscriptionPlanDetail.deletedCount} application(s) for planId: ${planId}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting SubscriptionPlanDetail:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}