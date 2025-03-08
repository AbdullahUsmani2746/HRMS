import Ticket from "@/models/Helpdesk/helpdesk.models";
import connectDB from "@/utils/dbConnect";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Connect to the database
await connectDB();

/**
 * GET method to fetch filtered status of tickets and their questions
 */
export async function GET(req, { params }) {
  const { id } = params;
 
  if (!id) {
    return NextResponse.json({ message: 'ID is required.' }, { status: 400 });
  }

  try {
    // Fetch tickets based on employee or employer ID
    let tickets = [];
    if (id.startsWith('CLIENT-')) {
      tickets = await Ticket.find({ employerId: id }, 'status questions.status');
    } else {
      tickets = await Ticket.find({ employeeId: id }, 'status questions.status');
    }

    if (!tickets.length) {
      return NextResponse.json({ message: 'No tickets found.' }, { status: 404 });
    }

    // Calculate complaint status counts
    const complaintStatusCounts = tickets.reduce(
      (acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
      },
      { open: 0, completed: 0 }
    );

    // Calculate question status counts
    const questionStatusCounts = tickets.reduce((acc, ticket) => {
      ticket.questions.forEach((question) => {
        acc[question.status] = (acc[question.status] || 0) + 1;
      });
      return acc;
    }, {});

    return NextResponse.json({
      complaintStatusCounts,
      questionStatusCounts,
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching ticket statuses:', error);
    return NextResponse.json(
      { message: 'Failed to fetch ticket statuses.', error: error.message },
      { status: 500 }
    );
  }
}
