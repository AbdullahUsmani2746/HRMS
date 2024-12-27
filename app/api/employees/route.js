import { NextResponse } from "next/server";
import connectDB from "@/utils/dbConnect";
import Employee from "@/models/Employee/employee.models";
import { ObjectId } from "bson";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;

  // Retrieve departmentId or employerId from query parameters
  const departmentId = searchParams.get("departmentId");
  const employerId = searchParams.get("employerId");
  const managerId = searchParams.get("managerId");

  await connectDB(); // Ensure your database connection is established

  try {
    // Build the query object dynamically
    const query = {};

    if (departmentId) {
      query.department = departmentId;
    } else if (employerId) {
      query.clientId = employerId;
    } else if (managerId) {
      if (ObjectId.isValid(managerId)) {
        query.manager = new ObjectId(managerId);
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid managerId format" },
          { status: 400 }
        );
      }
}

    console.log(query);

    // Fetch employers based on the query
    const employers = await Employee.find(query);

    console.log(employers)

    return NextResponse.json({
      message: "Employers fetched from the database",
      data: employers,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();
    const employer = new Employee(body);
    console.log("Employer", employer);

    // Save the document in MongoDB
    await employer.save();
    return NextResponse.json(
      { message: "Employer added to the Database", data: employer },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `Employer Not Added ${error.message}` },
      { status: 400 }
    );
  }
}
