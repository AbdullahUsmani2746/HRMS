import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import Payslip from '@/models/Payroll/payslip.models';
import Employee from '@/models/Employee/employee.models';
import { z } from 'zod';
import ExcelJS from 'exceljs';
import nodemailer from 'nodemailer';

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employerId = searchParams.get('employerId');
    
    const query = {
      ...(startDate && endDate && {
        "payPeriodDetails.startDate": { 
          $gte: startDate, 
          $lte: endDate
        }
      }),
      ...(employerId && { employerId })
    };

    const payslips = await Payslip.find(query);

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
    const payslip = new Payslip(body);
    await payslip.save();

    // Find employee to get their email if not provided in payslip
    let employeeEmail = payslip.employeeEmail;
    if (!employeeEmail && payslip.employeeId) {
      const employee = await Employee.findById(payslip.employeeId);
      if (employee && employee.email) {
        employeeEmail = employee.email;
      }
    }

    // Send email with payslip and Excel attachment
    if (employeeEmail) {
      await sendPayslipEmail(employeeEmail, payslip);
    } else {
      console.warn(`No email found for employee: ${payslip.employeeName} (ID: ${payslip.employeeId})`);
    }

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

// Function to generate Excel file for payslip
async function generatePayslipExcel(payslip) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Payslip');
  
  // Add company logo and header
  worksheet.mergeCells('A1:F1');
  const headerCell = worksheet.getCell('A1');
  headerCell.value = 'EMPLOYEE PAYSLIP';
  headerCell.font = { size: 16, bold: true };
  headerCell.alignment = { horizontal: 'center' };
  
  // Add payslip period details
  worksheet.mergeCells('A2:F2');
  worksheet.getCell('A2').value = `Pay Period: ${new Date(payslip.payPeriodDetails.startDate).toLocaleDateString()} to ${new Date(payslip.payPeriodDetails.endDate).toLocaleDateString()}`;
  worksheet.getCell('A2').alignment = { horizontal: 'center' };
  
  // Employee details
  worksheet.addRow([]);
  worksheet.addRow(['Employee Details', '', '', '', '', '']);
  worksheet.mergeCells('A4:F4');
  worksheet.getCell('A4').font = { bold: true };
  
  worksheet.addRow(['Employee Name:', payslip.employeeName, '', 'Employee ID:', payslip.employeeId, '']);
  worksheet.addRow(['Pay Type:', payslip.payType, '', '', '', '']);
  worksheet.addRow([]);
  
  // Work details
  if (payslip.workDetails) {
    worksheet.addRow(['Work Details', '', '', '', '', '']);
    worksheet.mergeCells('A8:F8');
    worksheet.getCell('A8').font = { bold: true };
    
    worksheet.addRow(['Total Work Hours:', payslip.workDetails.totalWorkHours, '', 'Overtime Hours:', payslip.workDetails.overtimeHours, '']);
    worksheet.addRow(['Hourly Rate:', payslip.workDetails.hourlyRate, '', 'Overtime Rate:', payslip.workDetails.overtimeRate, '']);
    worksheet.addRow([]);
  }
  
  // Payroll breakdown
  worksheet.addRow(['Payroll Breakdown', '', '', '', '', '']);
  worksheet.mergeCells('A12:F12');
  worksheet.getCell('A12').font = { bold: true };
  
  // Earnings
  worksheet.addRow(['Earnings', '', '', '', '', '']);
  worksheet.getCell('A13').font = { bold: true };
  
  worksheet.addRow(['Base Salary:', payslip.payrollBreakdown.baseSalary, '', '', '', '']);
  worksheet.addRow(['Allowances:', payslip.payrollBreakdown.allowances, '', '', '', '']);
  worksheet.addRow(['Overtime Pay:', payslip.payrollBreakdown.overtimePay, '', '', '', '']);
  
  // Deductions
  worksheet.addRow([]);
  worksheet.addRow(['Deductions', '', '', '', '', '']);
  worksheet.getCell('A18').font = { bold: true };
  
  worksheet.addRow(['PAYE Tax:', payslip.payrollBreakdown.deductions.paye, '', '', '', '']);
  worksheet.addRow(['ACC Levy:', payslip.payrollBreakdown.deductions.acc, '', '', '', '']);
  worksheet.addRow(['NPF Contribution:', payslip.payrollBreakdown.deductions.npf, '', '', '', '']);
  worksheet.addRow(['Other Deductions:', payslip.payrollBreakdown.deductions.other, '', '', '', '']);
  worksheet.addRow(['Total Deductions:', payslip.payrollBreakdown.deductions.total, '', '', '', '']);
  
  // Summary
  worksheet.addRow([]);
  worksheet.addRow(['Summary', '', '', '', '', '']);
  worksheet.getCell('A24').font = { bold: true };
  
  worksheet.addRow(['Gross Pay:', payslip.payrollBreakdown.baseSalary + payslip.payrollBreakdown.allowances + payslip.payrollBreakdown.overtimePay, '', '', '', '']);
  worksheet.addRow(['Total Deductions:', payslip.payrollBreakdown.deductions.total, '', '', '', '']);
  worksheet.addRow(['Net Payable:', payslip.payrollBreakdown.netPayable, '', '', '', '']);
  worksheet.getCell('A27').font = { bold: true };
  worksheet.getCell('B27').font = { bold: true };
  
  // Employer contributions (for information)
  worksheet.addRow([]);
  worksheet.addRow(['Employer Contributions (For Information)', '', '', '', '', '']);
  worksheet.getCell('A29').font = { bold: true };
  
  worksheet.addRow(['Employer ACC Contribution:', payslip.payrollBreakdown.employerContributions.acc, '', '', '', '']);
  worksheet.addRow(['Employer NPF Contribution:', payslip.payrollBreakdown.employerContributions.npf, '', '', '', '']);
  worksheet.addRow(['Total Employer Contributions:', payslip.payrollBreakdown.employerContributions.total, '', '', '', '']);
  
  // Style the worksheet
  worksheet.columns.forEach(column => {
    column.width = 18;
  });
  
  // Format currency cells
  ['B14', 'B15', 'B16', 'B19', 'B20', 'B21', 'B22', 'B23', 'B25', 'B26', 'B27', 'B30', 'B31', 'B32'].forEach(cell => {
    worksheet.getCell(cell).numFmt = '$#,##0.00';
  });
  
  // Return as buffer
  return await workbook.xlsx.writeBuffer();
}

// Function to send the email to the employee using Nodemailer
async function sendPayslipEmail(employeeEmail, payslip) {
  try {
    // Generate Excel file
    const excelBuffer = await generatePayslipExcel(payslip);
    
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // e.g., 'smtp.gmail.com', 'smtp.office365.com'
      port: parseInt(process.env.EMAIL_PORT || '587'), // Usually 587 for TLS
      secure: process.env.EMAIL_SECURE === 'true', // true for 465 port, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      // For Gmail, you may need these additional settings
      ...(process.env.EMAIL_HOST === 'smtp.gmail.com' && {
        tls: {
          rejectUnauthorized: false
        }
      })
    });
    
    // Format dates for email
    const startDate = new Date(payslip.payPeriodDetails.startDate).toLocaleDateString();
    const endDate = new Date(payslip.payPeriodDetails.endDate).toLocaleDateString();
    
    // Email options
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME} Payroll" <${process.env.EMAIL_USER}>`,
      to: employeeEmail,
      subject: `Your Payslip for ${startDate} - ${endDate}`,
      text: generatePayslipText(payslip),
      html: generatePayslipHtml(payslip),
      attachments: [
        {
          filename: `Payslip_${payslip.employeeName}_${endDate.replace(/\//g, '-')}.xlsx`,
          content: excelBuffer
        }
      ]
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Payslip email sent to:', employeeEmail, 'Message ID:', info.messageId);
    
    return info;
  } catch (error) {
    console.error('Error sending payslip email:', error);
    throw error; // Re-throw to handle in the calling function if needed
  }
}

// Helper function to generate plain text email content
function generatePayslipText(payslip) {
  const startDate = new Date(payslip.payPeriodDetails.startDate).toLocaleDateString();
  const endDate = new Date(payslip.payPeriodDetails.endDate).toLocaleDateString();
  
  return `
    Dear ${payslip.employeeName},

    Please find attached your payslip for the period ${startDate} to ${endDate}.

    PAYSLIP SUMMARY:
    
    Pay Period: ${startDate} to ${endDate}
    
    Gross Pay: $${(payslip.payrollBreakdown.baseSalary + payslip.payrollBreakdown.allowances + payslip.payrollBreakdown.overtimePay).toFixed(2)}
    Total Deductions: $${payslip.payrollBreakdown.deductions.total.toFixed(2)}
    Net Pay: $${payslip.payrollBreakdown.netPayable.toFixed(2)}
    
    Your detailed payslip is attached to this email as an Excel file.
    
    If you have any questions regarding your payslip, please contact the HR department.

    This is an automatically generated email. Please do not reply directly to this message.

    Best regards,
    ${process.env.COMPANY_NAME} Payroll Team
  `;
}

// Helper function to generate HTML email content
function generatePayslipHtml(payslip) {
  const startDate = new Date(payslip.payPeriodDetails.startDate).toLocaleDateString();
  const endDate = new Date(payslip.payPeriodDetails.endDate).toLocaleDateString();
  const grossPay = payslip.payrollBreakdown.baseSalary + payslip.payrollBreakdown.allowances + payslip.payrollBreakdown.overtimePay;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { font-size: 12px; text-align: center; margin-top: 30px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; }
        th { background-color: #f8f9fa; }
        .highlight { font-weight: bold; color: #0056b3; }
        .total-row { font-weight: bold; border-top: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${process.env.COMPANY_NAME} Payroll</h2>
          <p>Pay Period: ${startDate} to ${endDate}</p>
        </div>
        
        <div class="content">
          <p>Dear ${payslip.employeeName},</p>
          
          <p>Please find attached your payslip for the period <strong>${startDate}</strong> to <strong>${endDate}</strong>.</p>
          
          <h3>Payslip Summary</h3>
          
          <table>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
            <tr>
              <td>Gross Pay</td>
              <td>$${grossPay.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Total Deductions</td>
              <td>$${payslip.payrollBreakdown.deductions.total.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>Net Pay</td>
              <td class="highlight">$${payslip.payrollBreakdown.netPayable.toFixed(2)}</td>
            </tr>
          </table>
          
          <p>Your detailed payslip is attached to this email as an Excel file.</p>
          
          <p>If you have any questions regarding your payslip, please contact the HR department.</p>
          
          <p>This is an automatically generated email. Please do not reply directly to this message.</p>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${process.env.COMPANY_NAME}. All rights reserved.</p>
          <p>This email and any attachments are confidential and intended solely for the use of the individual or entity to whom they are addressed.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}