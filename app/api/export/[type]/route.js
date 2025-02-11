import ExcelJS from 'exceljs';
import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import Payslip from '@/models/Payroll/payslip.models';
import { createACCTemplate } from '@/app/templates/accTemplate';
import { createNPFTemplate } from '@/app/templates/npfTemplate';
import { createP4Template } from '@/app/templates/p4Template';
import Employer from '@/models/employer.models';


export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
      // Extract the ID from the URL path
      console.log("TYPE: ", params.type);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format');
    const clientID = searchParams.get('employerId');
    const periodType = searchParams.get('periodType');


    // Calculate year and base month
  const year = new Date(startDate).getFullYear();
  const month = new Date(endDate).getMonth() + 1; // JavaScript months are 0-based
    
    if (!startDate || !endDate || !format) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    const query = {
        ...(startDate && endDate && {
          "payPeriodDetails.startDate": { 
            $gte: startDate, 
            $lte: endDate
          }
        }),
        // ...(employerId && { employerId })  // Uncomment if you want to filter by employerId
      };


    const payslips = await Payslip.find(query);
    const EmployerDetails = await Employer.findOne({employerId: clientID})

    console.log("Employer Details: ", EmployerDetails)

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Payroll System';
    workbook.created = new Date();
    
    if (params.type === 'acc') {
      await createACCTemplate(workbook, { month, year, payslips, periodType, EmployerDetails });
    }
    else if (params.type === 'npf') {
        await createNPFTemplate(workbook, { month, year,payslips, periodType, EmployerDetails });
      }
      else if (params.type === 'paye') {
        await createP4Template(workbook, {month, year, payslips, periodType, EmployerDetails });
      }


    const buffer = await workbook.xlsx.writeBuffer();
    const response = new NextResponse(buffer);
    
    response.headers.set(
      'Content-Type', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    response.headers.set(
      'Content-Disposition', 
      `attachment; filename=acc-report-${year}-${month}.xlsx`
    );

    return response;

  } catch (error) {
    console.error(`GET /api/export/${params.type} error:`, error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}