export async function GET(req, { params }) {
    const { employeeId } = params;
    console.log(employeeId)
    await connectDB();
  
    try {
      const attendance = await Attendance.find({
        employeeId: employeeId
      });
  
      if (!attendance) {
        return NextResponse.json(
          { message: "No attendance data found for today." },
          { status: 200 }
        );
      }
  
      return NextResponse.json(attendance);
    } catch (error) {
      return NextResponse.json(
        { message: "Error fetching attendance data.", error },
        { status: 500 }
      );
    }
  }
  