import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbConnect';
import Payslip from '@/models/Payroll/payslip.models';
import Employee from '@/models/Employee/employee.models';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';


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

   // Attempt email with error isolation
   if (employeeEmail) {
    try {
      await sendPayslipEmail(employeeEmail, payslip);
    } catch (emailError) {
      console.error('Email failed:', emailError);
      // // Optional: Update payslip status here
      // payslip.emailStatus = 'failed';
      // await payslip.save();
    }
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
async function generatePayslipPDF(payslip) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Create HTML template matching your sample
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 30px; }
        .company-header { text-align: center; margin-bottom: 20px; }
        .payslip-title { text-align: center; font-size: 24px; margin: 30px 0; }
        .details-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
        .totals { display: flex; justify-content: space-between; margin: 20px 0; }
        .net-pay { font-weight: bold; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="company-header">
        <h2>BRAVOS LIMITED</h2>
        <p>2nd Floor, Potoi Building, Matafele, Apia, Samoa</p>
        <p>T: (+685) 609061 | E: team@bravoslimited.com</p>
      </div>

      <h1 class="payslip-title">PAYSLIP</h1>

      <div class="details-row">
        <div>
          <p><strong>Employee:</strong> ${payslip.employeeName}</p>
          <p><strong>Position:</strong> ${payslip.position}</p>
        </div>
        <div>
          <p><strong>Employee ID:</strong> ${payslip.employeeId}</p>
          <p><strong>Department:</strong> ${payslip.department}</p>
        </div>
      </div>

      <div class="details-row">
        <p><strong>Period:</strong> ${payslip.payPeriodDetails.startDate} - ${payslip.payPeriodDetails.endDate}</p>
        <p><strong>Pay Day:</strong> ${payslip.payDate}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Payments</th>
            <th>Hours</th>
            <th>Rate</th>
            <th>Value</th>
            <th>Deductions</th>
            <th>Reference</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Normal Time</td>
            <td>${payslip.workDetails.totalWorkHours}</td>
            <td>${payslip.hourlyRate}</td>
            <td>${payslip.payrollBreakdown.baseSalary}</td>
            <td>SNPF</td>
            <td>KYY56</td>
            <td>${payslip.payrollBreakdown.deductions.npf}</td>
          </tr>
          <!-- Add other rows -->
        </tbody>
      </table>

      <div class="totals">
        <div>
          <p><strong>Total Payments:</strong> ${
            payslip.payrollBreakdown.baseSalary + 
            payslip.payrollBreakdown.allowances + 
            payslip.payrollBreakdown.overtimePay
          }</p>
        </div>
        <div>
          <p><strong>Total Deductions:</strong> ${payslip.payrollBreakdown.deductions.total}</p>
        </div>
      </div>

      <p class="net-pay">Net Pay: ${payslip.payrollBreakdown.netPayable}</p>
    </body>
    </html>
  `;

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ 
    format: 'A4',
    margin: { top: '30px', right: '40px', bottom: '30px', left: '40px' }
  });

  await browser.close();
  return pdfBuffer;
}

// Function to send the email to the employee using Nodemailer
async function sendPayslipEmail(employeeEmail, payslip) {
  try {
    // Generate Excel file
    const pdfBuffer = await generatePayslipPDF(payslip);
    
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
          filename: `Payslip_${payslip.employeeName}_${endDate.replace(/\//g, '-')}.pdf`,
          content: pdfBuffer
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
    
    Your detailed payslip is attached to this email as a PDF file
    
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
          
          <p>Your detailed payslip is attached to this email as a PDF file.</p>
          
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