import Ticket from "@/models/Helpdesk/helpdesk.models";
import connectDB from "@/utils/dbConnect";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Connect to the database
await connectDB();

/**
 * GET method to fetch ticket details by employee or employer ID
 */
export async function GET(req, { params }) {
  const { id } = await params;
  console.log(id)

  if (!id) {
    return NextResponse.json({ message: "ID is required." }, { status: 400 });
  }

  try {
    let tickets;

    if (id.startsWith("CLIENT-")) {

      tickets = await Ticket.find({ employerId: id });
    }
    else if (id === "admin") {
      tickets = await Ticket.find({ isAdmin: true });

    }
    else {

      tickets = await Ticket.find({ employeeId: id });
    }

    if (!tickets.length) {
      return NextResponse.json({ message: "No tickets found." }, { status: 404 });
    }


    // Calculate complaint status counts
    const complaintStatusCounts = tickets.reduce(
      (acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
      },
      { open: 0, Closed: 0 }
    );

    // Calculate question status counts
    const questionStatusCounts = tickets.reduce((acc, ticket) => {
      ticket.questions.forEach((question) => {
        acc[question.status] = (acc[question.status] || 0) + 1;
      });
      return acc;
    }, { "In Progress": 0, Resolved: 0, Rejected: 0 });


    return NextResponse.json({ complaintStatusCounts, questionStatusCounts, data: tickets, status: 200 });
  } catch (error) {
    console.error("Error fetching tickets:", error);
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
  let { id } = await params;

  if (!id) {
    return NextResponse.json({ message: "Ticket ID is required." }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid Ticket ID format." }, { status: 400 });
  }

  try {
    const { status, answer, index, complaint, rejectionReason } = await req.json();

    if (!status && (!answer || answer.trim().toLowerCase() === "none")) {
      return NextResponse.json({ message: "Either status or a valid answer is required." }, { status: 400 });
    }

    console.log(id, status, answer, index, complaint, rejectionReason);

    const updateData = {
      status: complaint ? status : "open",
    };

    if (!complaint) {
      updateData[`questions.${index}.status`] = status;
      updateData[`questions.${index}.answers`] = answer;

      if (status === "Rejected" && rejectionReason) {
        updateData[`questions.${index}.rejectionReason`] = rejectionReason;
      }
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedTicket) {
      return NextResponse.json({ message: "Ticket not found." }, { status: 404 });
    }

    return NextResponse.json({ data: updatedTicket, status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update ticket.", error: error.message }, { status: 500 });
  }
}
