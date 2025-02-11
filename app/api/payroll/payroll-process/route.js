import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import PayrollProcess from '@/models/Payroll/payrollProcess.models';

export async function GET(request) {
    try {

      const searchParams = request.nextUrl.searchParams
      const employerId = searchParams.get('employerId') 
      console.log("employerId", employerId)


      await connectDB();
  
      // Fetch all payroll processes
      const payrolls = await PayrollProcess.find({employerId: employerId} );
  
      // Return success response
      return NextResponse.json({ success: true, data: payrolls }, { status: 200 });
    } catch (error) {
      // Handle error response
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  export async function POST(request) {
    try {
      await connectDB();
  
      // Parse the incoming request body
      const { date_from, date_to, employerId } = await request.json();
  
      if (!date_from || !date_to || !employerId) {
        return NextResponse.json(
          { success: false, error: "All fields (date_from, date_to, employerId) are required." },
          { status: 400 }
        );
      }
  
      const fromDate = new Date(date_from);
      const toDate = new Date(date_to);
  
      // Validate that `date_from` is before `date_to`
      if (fromDate >= toDate) {
        return NextResponse.json(
          { success: false, error: "`date_from` must be earlier than `date_to`." },
          { status: 400 }
        );
      }
  
      // Check for overlapping date ranges in the database
      const overlappingPayroll = await PayrollProcess.findOne({
        employerId,
        $or: [
          { date_from: { $lte: toDate }, date_to: { $gte: fromDate } },
        ],
      });
  
      if (overlappingPayroll) {
        return NextResponse.json(
          { success: false, error: "Overlapping payroll period exists. Please adjust the dates." },
          { status: 400 }
        );
      }
  
  // Calculate year and base month
  const year = fromDate.getFullYear();
  const baseMonthNo = fromDate.getMonth() + 1; // JavaScript months are 0-based
  
  // Get the week boundaries
  const startOfWeek = new Date(fromDate);
  
  const endOfWeek = new Date(toDate);
  
  // Count days in current month vs next month for this week
  let daysInCurrentMonth = 0;
  let daysInNextMonth = 0;
  
  const tempDate = new Date(startOfWeek);
  for (let i = 0; i < 7; i++) {
    if (tempDate.getMonth() === fromDate.getMonth()) {
      daysInCurrentMonth++;
    } else {
      daysInNextMonth++;
    }
    tempDate.setDate(tempDate.getDate() + 1);
  }
  
  // Determine which month to assign this week to
  const monthNo = daysInNextMonth > daysInCurrentMonth ? 
    (baseMonthNo % 12) + 1 : baseMonthNo;
    
  // Calculate week number based on the date's position in its assigned month
  let weekNo;
  
  if (daysInNextMonth > daysInCurrentMonth) {
    // If the week belongs to the next month, start counting from week 1
    weekNo = 1;
  } else {
    // Only count days within the current month
    const firstDayOfMonth = new Date(year, monthNo - 1, 1);
    const firstWeekDay = firstDayOfMonth.getDay();
    const dateOfMonth = fromDate.getDate();
    
    console.log(`
      
      firstDayOfMonth:${firstDayOfMonth}
firstWeekDay:${firstWeekDay}
dateOfMonth:${dateOfMonth}`)
    // Calculate the week number for dates in the current month
    weekNo = Math.ceil((dateOfMonth + firstWeekDay) / 7);
  }

  console.log(
    `
    weekNO: ${weekNo},
daysInCurrentMonth:${daysInCurrentMonth},
daysInNextMonth:${daysInNextMonth}
endOfWeek:${endOfWeek}
startOfWeek:${startOfWeek}
baseMonthNo:${baseMonthNo}
year:${year},
baseMonthNo:${baseMonthNo}
monthNo:${monthNo}




    `
  )
  
  // Generate a unique payroll ID
  const payrollId = Math.floor(Math.random() * 1000000);
  
      // Create a new payroll process
      const newPayroll = new PayrollProcess({
        payroll_id: payrollId,
        date_from: fromDate,
        date_to: toDate,
        month_no: monthNo,
        week_no: weekNo,
        year,
        employerId,
      });
  
      const savedPayroll = await newPayroll.save();
  
      // Return success response
      return NextResponse.json({ success: true, data: savedPayroll }, { status: 201 });
    } catch (error) {
      // Handle error response
      console.error("Error in creating payroll process:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }
  


