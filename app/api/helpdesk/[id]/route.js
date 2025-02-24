import { NextResponse } from "next/server";
import connectDB from "@/utils/dbConnect";
import Ticket from "@/models/Helpdesk/helpdesk.models";

// Connect to the database
await connectDB();

/**
 * GET method to fetch ticket details by ID
 */
export async function GET(req, { params }) {
  const { id } = params;
  try {
    const ticket = await Ticket.find({ employeeId: id });
    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch ticket.", error: error.message },
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
    const newTicket = new Ticket(body);
    await newTicket.save();
    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create ticket.", error: error.message },
      { status: 500 }
    );
  }
}
