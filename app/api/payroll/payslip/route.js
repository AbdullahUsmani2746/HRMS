import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import Payslip from '@/models/Payroll/payslip.models';
import { z } from 'zod';

// const payslipSchema = z.object({
//   employeeId: z.string(),
//   employerId: z.string(),
//   employeeName: z.string(),
//   payrollId:z.number(),
//   payType: z.enum(['HOUR', 'SALARY']),
//   payPeriodDetails: z.object({
//     startDate: z.string(),
//     endDate: z.string(),
//     totalDays: z.number(),
//     expectedBaseHours: z.number()
//   }),
//   workDetails: z.object({
//     totalWorkHours: z.number(),
//     overtimeHours: z.number(),
//     hourlyRate: z.number(),
//     overtimeRate: z.number()
//   }),
//   payrollBreakdown: z.object({
//     baseSalary: z.number(),
//     allowances: z.number(),
//     deductions: z.object({
//       paye: z.number(),
//       acc: z.number(),
//       npf: z.number(),
//       other: z.number(),
//       total: z.number()
//     }),
//     employerContributions: z.object({
//       acc: z.number(),
//       npf: z.number(),
//       total: z.number()
//     }),
//     overtimePay: z.number(),
//     netPayable: z.number()
//   })
// });

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    // const startDate2 = searchParams.get('startDate');
    // const startDate = "2025-01-27T19:00:00.000Z";
    
    // const endDate2 = searchParams.get('endDate');
    // const endDate = "2025-01-29T19:00:00.000Z";

    // const employerId = searchParams.get('employerId');
    
    // const query = {
    //   ...(startDate && endDate && {
    //     'payPeriodDetails.startDate': { 
    //       $gte: new Date(startDate),
    //       $lte: new Date(endDate)
    //     }
    //   }),
    //   ...(employerId && { employerId })
    // };

    const payslips = await Payslip.find({});
      // .sort({ 'payPeriodDetails.startDate': -1 });

    return NextResponse.json(payslips);

  } catch (error) {
    console.error('GET /api/payslips error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payslips' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    // const validatedData = payslipSchema.parse(body);

    // const deductions = validatedData.payrollBreakdown.deductions;
    // deductions.total = deductions.paye + deductions.acc + 
    //                   deductions.npf + deductions.other;

    // const employerContributions = validatedData.payrollBreakdown.employerContributions;
    // employerContributions.total = employerContributions.acc + 
    //                              employerContributions.npf;

    // validatedData.payrollId = `${validatedData.employerId}-${
    //   new Date(validatedData.payPeriodDetails.startDate).getTime()
    // }`;

    const payslip = new Payslip(body);
    await payslip.save();

    return NextResponse.json(payslip, { status: 201 });

  } catch (error) {
    console.error('POST /api/payslips error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create payslip' },
      { status: 500 }
    );
  }
}