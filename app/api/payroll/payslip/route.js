import connectDB from "@/utils/dbConnect"; // Import database connection utility
import Payslip from "@/models/Payroll/payslip.models"; // Import the Payslip model

export async function POST(req) {
  await connectDB(); // Connect to the database

  try {
    const data = await req.json(); // Parse the JSON body
    const newPayslip = new Payslip(data); // Create a new Payslip document
    await newPayslip.save(); // Save the document to the database

    return new Response(JSON.stringify(newPayslip), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error creating payslip", error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
