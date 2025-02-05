import ExcelJS from 'exceljs';
import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import Payslip from '@/models/Payroll/payslip.models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const format = searchParams.get('format');
    
    if (!month || !year || !format) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    // const payslips = await Payslip.find({
    //   'payPeriodDetails.startDate': {
    //     $gte: startDate,
    //     $lte: endDate
    //   }
    // });

    const payslips = await Payslip.find({
      });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Payroll System';
    workbook.created = new Date();
    
    const worksheet = workbook.addWorksheet('Report', {
      properties: { tabColor: { argb: 'FFC0000' } }
    });

    // Configure columns based on report type
    if (params.type === 'acc') {
      worksheet.columns = [
        { header: 'Employee ID', key: 'employeeId', width: 15 },
        { header: 'Employee Name', key: 'employeeName', width: 25 },
        { header: 'Earnings', key: 'earnings', width: 15, style: { numFmt: '$#,##0.00' } },
        { header: 'ACC Levy', key: 'accLevy', width: 15, style: { numFmt: '$#,##0.00' } }
      ];

      // Add data rows
      payslips.forEach(payslip => {
        worksheet.addRow({
          employeeId: payslip.employeeId,
          employeeName: payslip.employeeName,
          earnings: payslip.payrollBreakdown.baseSalary + payslip.payrollBreakdown.allowances,
          accLevy: payslip.payrollBreakdown.deductions.acc
        });
      });
    }

    // Add totals row
    const totalRow = worksheet.addRow({
      employeeId: 'Total',
      employeeName: '',
      earnings: { formula: 'SUM(C2:C' + (payslips.length + 1) + ')' },
      accLevy: { formula: 'SUM(D2:D' + (payslips.length + 1) + ')' }
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Style total row
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add borders
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

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