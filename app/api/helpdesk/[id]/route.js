import Ticket from "@/models/Helpdesk/helpdesk.models";
import connectDB from "@/utils/dbConnect";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Connect to the database
await connectDB();

/**
 * GET method to fetch ticket details by employee ID
 */
export async function GET(req, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: "Employee ID is required." }, { status: 400 });
  }

  try {
    // Fetch only required fields
    const tickets = await Ticket.find({ employeeId: id });

    if (!tickets.length) {
      return NextResponse.json({ message: "No tickets found." }, { status: 404 });
    }

    return NextResponse.json({data: tickets, status: 200 });
  } catch (error) {
    console.error("Error fetching tickets:", error); // Console log for debugging
    return NextResponse.json(
      { message: "Failed to fetch tickets.", error: error.message },
      { status: 500 }
    );
  }
}


/**
 * POST method to create a new ticket
 */

export async function POST(req) {
  try {
    const body = await req.json();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const lastTicket = await Ticket.findOne().sort({ date: -1 }).session(session);
      
      let newComplaintNumber = "TKT-001"; // Default if no ticket exists

      if (lastTicket) {
        const lastNumber = parseInt(lastTicket.complaintNumber.split("-")[1], 10);
        newComplaintNumber = `TKT-${String(lastNumber + 1).padStart(3, "0")}`;
      }

      const existingTicket = await Ticket.findOne({ complaintNumber: newComplaintNumber }).session(session);
      if (existingTicket) {
        throw new Error("Duplicate complaint number detected, retrying...");
      }

      const newTicket = new Ticket({
        ...body,
        complaintNumber: newComplaintNumber,
      });

      await newTicket.save({ session });

      await session.commitTransaction();
      session.endSession();

      return NextResponse.json(newTicket, { status: 201 });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: "Failed to create ticket.", error: error.message }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Failed to create ticket.", error: error.message }, { status: 500 });
  }
}

/**
 * PUT method to update ticket status
 */
export async function PUT(req, { params }) {
  let { id } = params;

  if (!id) {
    return NextResponse.json({ message: "Ticket ID is required." }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid Ticket ID format." }, { status: 400 });
  }

  try {
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ message: "Status is required." }, { status: 400 });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      { status },
      { new: true }
    );

    if (!updatedTicket) {
      return NextResponse.json({ message: "Ticket not found." }, { status: 404 });
    }

    return NextResponse.json({ data: updatedTicket, status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update ticket.", error: error.message }, { status: 500 });
  }
}



