// pages/api/subscriptionPlanApplication/[id].js

import { NextResponse } from "next/server";
import connectDB from "@/utils/dbConnect";
import SubscriptionPlanApplication from '@/models/Subscription/SubscriptionPlanApplications.models';
import { ObjectId } from "bson";

export async function PUT(request,value) {
  await connectDB();
  try {
    const planId = value.params.id; // Get planId from query
    const { applicationIds } = await request.json(); // Parse the request body
    console.log(`Plan ID: ${planId}`);
    console.log(`New Application IDs: ${applicationIds}`);
    if (!planId || !Array.isArray(applicationIds)) {
      return NextResponse.json(
        { success: false, message: "Invalid planId or applicationIds" },
        { status: 400 }
      );
    }

   

    // Fetch existing applications for the plan
    const existingApplications = await SubscriptionPlanApplication.find({
      planId: new ObjectId(planId),
    });

    const existingApplicationIds = existingApplications.map((app) =>
      app.applicationId.toString()
    );

    console.log(`Existing Application IDs: ${existingApplicationIds}`);

    // Identify applications to remove and to add
    const applicationIdsToRemove = existingApplicationIds.filter(
      (id) => !applicationIds.includes(id)
    );

    const applicationIdsToAdd = applicationIds.filter(
      (id) => !existingApplicationIds.includes(id)
    );

    console.log(`To Remove: ${applicationIdsToRemove}`);
    console.log(`To Add: ${applicationIdsToAdd}`);

    // Delete applications no longer associated
    if (applicationIdsToRemove.length > 0) {
      await SubscriptionPlanApplication.deleteMany({
        planId: new ObjectId(planId),
        applicationId: { $in: applicationIdsToRemove.map((id) => new ObjectId(id)) },
      });
    }

    // Add new applications
    if (applicationIdsToAdd.length > 0) {
      const newApplications = applicationIdsToAdd.map((id) => ({
        planId: new ObjectId(planId),
        applicationId: new ObjectId(id),
      }));

      await SubscriptionPlanApplication.insertMany(newApplications);
    }

    return NextResponse.json(
      { success: true, message: "Applications updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating applications:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}



export async function DELETE(request,value) {
  await connectDB();
  try {
   // Extract query parameters from the request URL
   console.log("here now")
 const planId = value.params.id;
 console.log(planId);
    const deletedSubscriptionPlanApplication = await SubscriptionPlanApplication.deleteMany({planId});
    if (deletedSubscriptionPlanApplication.deletedCount===0) {
      return NextResponse.json(
        { message: `Aplication not Deleted ` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: `Successfully deleted ${deletedSubscriptionPlanApplication.deletedCount} application(s) for planId: ${planId}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting Aplications:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}