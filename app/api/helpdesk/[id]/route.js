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
  try {
    const body = await req.json();

    const lastTicket = await Ticket.findOne({}, {}, { sort: { createdAt: -1 } });

    let newComplaintNumber = "TKT-001"; // Default value

    if (lastTicket && lastTicket.complaintNumber) {
      const lastNumber = parseInt(lastTicket.complaintNumber.replace("TKT-", ""), 10);
      newComplaintNumber = `TKT-${String(lastNumber + 1).padStart(3, "0")}`;
    }

    const newTicket = new Ticket({
      ...body,
      complaintNumber: newComplaintNumber,
    });

    await newTicket.save();

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create ticket.", error: error.message }, { status: 500 });
  }
}




