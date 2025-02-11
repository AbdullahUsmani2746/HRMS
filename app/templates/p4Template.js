import ExcelJS from 'exceljs';

export async function createP4Template(workbook, { month, year, payslips, periodType }) {
  const worksheet = workbook.addWorksheet('P4 Tax Form', {
    properties: { tabColor: { argb: 'FFC0000' } }
  });

  // Set column widths to match PDF layout
  worksheet.columns = [
    { width: 4 },   // A - Padding
    { width: 30 },  // B - Name
    { width: 12 },  // C - NPF Number
    { width: 12 },  // D - Pay Period
    { width: 12 },  // E - Pay 1
    { width: 12 },  // F - Pay 2
    { width: 12 },  // G - Pay 3
    { width: 12 },  // H - Total
    { width: 12 },  // I - Tax 1
    { width: 12 },  // J - Tax 2
    { width: 12 },  // K - Tax 3
    { width: 12 },  // L - Total Tax
    { width: 12 },  // M - NPF (9%)
    { width: 12 },  // N - ACC (1%)
  ];

  // Add logo
  try {
    const logoId = workbook.addImage({
      filename: 'public/uploads/images/samoa_logo.png',
      extension: 'png',
    });

    worksheet.mergeCells('A1:N6');
    worksheet.addImage(logoId, {
      tl: { col: 4, row: 0 },
      ext: { width: 150, height: 80 },
      position: {
        type: 'oneCellAnchor',
        from: {
          col: 5,
          row: 1,
          colOff: 0,
          rowOff: 0
        }
      }
    });
  } catch (error) {
    console.error('Logo loading error:', error);
  }

  // Header styling
  const headerStyle = {
    font: { bold: true, size: 12 },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  // Title section
  worksheet.mergeCells('A7:N7');
  const titleCell = worksheet.getCell('A7');
  titleCell.value = 'SALARY & WAGE TAX AND SOURCE DEDUCTION PAYMENT RECORDS';
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };

  worksheet.mergeCells('A8:N8');
  const subtitleCell = worksheet.getCell('A8');
  subtitleCell.value = 'Tax Administration Act 2012';
  subtitleCell.font = { size: 12 };
  subtitleCell.alignment = { horizontal: 'center' };

  // Company details section
  worksheet.mergeCells('A10:C10');
  worksheet.getCell('A10').value = 'PAYER / EMPLOYER:';
  worksheet.getCell('D10').value = 'Bravos Limited';

  worksheet.mergeCells('A11:C11');
  worksheet.getCell('A11').value = 'TAX IDENTIFICATION NUMBER:';
  worksheet.getCell('D11').value = 'Matafele, Apia Samoa';

  worksheet.mergeCells('I10:N10');
  worksheet.getCell('I10').value = `PAYMENT FOR THE MONTH OF ${month}-${year}`;
  worksheet.getCell('I10').alignment = { horizontal: 'center' };

  // Table headers
  const headerRow = worksheet.getRow(14);
  headerRow.values = [
    '',              // A
    'NAME OF EMPLOYEES', // B
    'NPF Number',    // C
    'PAY PERIOD',    // D
    'PAY PERIODS OF THE MONTH', // E-G
    '', '', '',
    'TAX DEDUCTIONS',  // I-L
    '', '', '',
    'NPF (9%)',     // M
    'ACC (1%)'      // N
  ];
  
  // Apply header styles
  headerRow.eachCell((cell) => {
    Object.assign(cell, headerStyle);
  });

  // Period numbers row
  const periodRow = worksheet.getRow(15);
  periodRow.values = [
    '', '', '', '',
    '1', '2', '3', 'TOTAL',
    '1', '2', '3', 'TOTAL TAX',
    '', ''
  ];
  periodRow.eachCell((cell) => {
    Object.assign(cell, headerStyle);
  });

  // Data rows
  let totalGrossPay = 0;
  let totalTax = 0;
  let totalNPF = 0;
  let totalACC = 0;
  let rowNumber = 16;

  payslips.forEach((payslip) => {
    const grossPay = payslip.payrollBreakdown.grossPay || 0;
    const paye = payslip.payrollBreakdown.deductions.paye || 0;
    const npf = grossPay * 0.09;  // 9% NPF
    const acc = grossPay * 0.01;  // 1% ACC

    // Calculate period values based on periodType
    const periodsInMonth = periodType === 'weekly' ? 4 : periodType === 'fortnightly' ? 2 : 1;
    const payPerPeriod = grossPay / periodsInMonth;
    const taxPerPeriod = paye / periodsInMonth;

    const row = worksheet.addRow([
      '',  // A
      payslip.employeeName,
      payslip.employeeId,
      periodType,
      payPerPeriod,
      periodsInMonth >= 2 ? payPerPeriod : 0,
      periodsInMonth >= 3 ? payPerPeriod : 0,
      grossPay,
      taxPerPeriod,
      periodsInMonth >= 2 ? taxPerPeriod : 0,
      periodsInMonth >= 3 ? taxPerPeriod : 0,
      paye,
      npf,
      acc
    ]);

    // Apply number formatting
    row.eachCell((cell, colNumber) => {
      if (typeof cell.value === 'number') {
        cell.numFmt = '#,##0.00';
        cell.alignment = { horizontal: 'right' };
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    totalGrossPay += grossPay;
    totalTax += paye;
    totalNPF += npf;
    totalACC += acc;
    rowNumber++;
  });

  // Add totals row
  const totalsRow = worksheet.addRow([
    '',
    'TOTALS',
    '',
    '',
    '',
    '',
    '',
    totalGrossPay,
    '',
    '',
    '',
    totalTax,
    totalNPF,
    totalACC
  ]);

  totalsRow.eachCell((cell) => {
    if (typeof cell.value === 'number') {
      cell.numFmt = '#,##0.00';
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'right' };
    }
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Add summary section
  const summaryStartRow = rowNumber + 3;
  worksheet.mergeCells(`A${summaryStartRow}:C${summaryStartRow}`);
  worksheet.getCell(`A${summaryStartRow}`).value = 'TOTAL GROSS PAY FROM';
  
  worksheet.mergeCells(`A${summaryStartRow + 1}:C${summaryStartRow + 1}`);
  worksheet.getCell(`A${summaryStartRow + 1}`).value = 'THIS MONTH';
  worksheet.getCell(`D${summaryStartRow + 1}`).value = totalGrossPay;
  worksheet.getCell(`D${summaryStartRow + 1}`).numFmt = '#,##0.00';
  
  worksheet.mergeCells(`A${summaryStartRow + 2}:C${summaryStartRow + 2}`);
  worksheet.getCell(`A${summaryStartRow + 2}`).value = 'TOTAL YEAR TO DATE';
  worksheet.getCell(`D${summaryStartRow + 2}`).value = totalGrossPay;
  worksheet.getCell(`D${summaryStartRow + 2}`).numFmt = '#,##0.00';

  // Add declaration section
  const declarationRow = summaryStartRow + 4;
  worksheet.mergeCells(`A${declarationRow}:N${declarationRow}`);
  worksheet.getCell(`A${declarationRow}`).value = 'DECLARATION:';
  worksheet.getCell(`A${declarationRow}`).font = { bold: true };

  worksheet.mergeCells(`A${declarationRow + 1}:N${declarationRow + 2}`);
  worksheet.getCell(`A${declarationRow + 1}`).value = 
    'I solemnly declare that the information provided in this form are true and correct; and I understand that any misleading or false information is an offence under the Tax Administration Act 2012';
  worksheet.getCell(`A${declarationRow + 1}`).alignment = { wrapText: true };

  // Signature section
  const signatureRow = declarationRow + 4;
  worksheet.getCell(`A${signatureRow}`).value = 'SIGNATURE OF EMPLOYER';
  worksheet.getCell(`A${signatureRow + 1}`).value = 'DESIGNATION';

  // Add note about eTax
  const noteRow = signatureRow + 3;
  worksheet.mergeCells(`A${noteRow}:N${noteRow}`);
  worksheet.getCell(`A${noteRow}`).value = 
    'You can now file your PAYE, VAGST and Income Tax Returns Online. Register for Samoa eTax at set.revenue.gov.ws';
  worksheet.getCell(`A${noteRow}`).font = { italic: true };
  worksheet.getCell(`A${noteRow}`).alignment = { horizontal: 'center' };

  return worksheet;
}