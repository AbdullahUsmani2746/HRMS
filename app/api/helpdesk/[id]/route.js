import { NextResponse } from "next/server";
import connectDB from "@/utils/dbConnect";
import Ticket from "@/models/Helpdesk/helpdesk.models";

// Connect to the database
await connectDB();

/**
 * GET method to fetch ticket details by employee ID
 */
export async function GET(req, { params }) {
  const { id } = params;
  try {
    const tickets = await Ticket.find({ employeeId: id });
    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ message: "No tickets found." }, { status: 404 });
    }
    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
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
  const body = await req.json();

  try {
    const lastTicket = await Ticket.findOne({}, {}, { sort: { complaintNumber: -1 } });

    let newComplaintNumber = "TKT-00100"; // Default number
    if (lastTicket && lastTicket.complaintNumber) {
      const lastNumber = parseInt(lastTicket.complaintNumber.split("-")[1]); // Extract numeric part
      newComplaintNumber = `TKT-${(lastNumber + 1).toString().padStart(5, "0")}`;
    }

    const newTicket = new Ticket({
      ...body, // Keep existing fields
      complaintNumber: newComplaintNumber, // Assign new unique complaintNumber
    });

    await newTicket.save();
    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create ticket.", error: error.message },
      { status: 500 }
    );
  }
}
