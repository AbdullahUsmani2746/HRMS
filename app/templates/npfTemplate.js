import ExcelJS from 'exceljs';

export async function createNPFTemplate(workbook, { month, year, payslips, periodType, EmployerDetails }) {
  const worksheet = workbook.addWorksheet('NPF Contribution', {
    properties: { tabColor: { argb: 'FFC0000' } }
  });

  // Set column widths
  worksheet.columns = [
    { header: '', key: 'col_a', width: 10 }, // NPF#
    { header: '', key: 'col_b', width: 35 }, // NAME OF EMPLOYEE
    { header: '', key: 'col_c', width: 12 }, // 1
    { header: '', key: 'col_d', width: 12 }, // 2
    { header: '', key: 'col_e', width: 12 }, // 3
    { header: '', key: 'col_f', width: 12 }, // 4
    { header: '', key: 'col_g', width: 12 }, // 5
    { header: '', key: 'col_h', width: 12 }, // TOTAL
  ];

  // Add title
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'NATIONAL PROVIDENT FUND';
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };

// Add company details
worksheet.getCell('A3').value = 'Employer :';
worksheet.getCell('B3').value = EmployerDetails.employerId;
worksheet.getCell('A4').value = 'Name :';
worksheet.getCell('B4').value = (EmployerDetails.businessName).toUpperCase();;
worksheet.getCell('A5').value = 'Address :';
worksheet.getCell('B5').value = (EmployerDetails.address).toUpperCase();;
worksheet.getCell('A6').value = 'CONTACT :';
worksheet.getCell('B6').value = (`${EmployerDetails.cpFirstName} ${EmployerDetails.cpMiddleName} ${EmployerDetails.cpSurname}`).toUpperCase();;


  // Add contribution schedule header
  worksheet.mergeCells('A8:H8');
  const scheduleHeader = worksheet.getCell('A8');
  scheduleHeader.value = 'C O N T R I B U T I O N    S C H E D U L E';
  scheduleHeader.font = { bold: true };
  scheduleHeader.alignment = { horizontal: 'center' };

  // Add page and period header
  worksheet.mergeCells('A9:H9');
  const pageHeader = worksheet.getCell('A9');
  pageHeader.value = `Page: 1                 ${periodType === 'monthly' ? 'Month' : periodType === 'fortnightly' ? 'Fortnight' : 'Week'}: ${month}-${year}`;
  pageHeader.alignment = { horizontal: 'center' };

  // Add contribution period header
  worksheet.mergeCells('A10:H10');
  const periodHeader = worksheet.getCell('A10');
  periodHeader.value = 'CONTRIBUTIONS FOR PAY PERIOD ENDING';
  periodHeader.alignment = { horizontal: 'center' };

  // Organize payslips based on period type
  const organizedPayslips = organizePayslips(payslips, periodType);

  // Add column headers based on period type
  const columnHeaders = getColumnHeaders(periodType);
  columnHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(`${String.fromCharCode(67 + index)}11`);
    cell.value = header;
    cell.alignment = { horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Add NPF# and NAME OF EMPLOYEE headers
  worksheet.getCell('A14').value = 'NPF#';
  worksheet.getCell('B14').value = 'NAME OF EMPLOYEE';

  // Add data rows from organized payslips
  const startRow = 15;
  organizedPayslips.forEach((payslip) => {
    const row = worksheet.addRow([
      payslip.employeeId,
      payslip.employeeName,
      ...generatePeriodValues(payslip, periodType),
      calculateTotalNPF(payslip)
    ]);

    // Style the data row
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (typeof cell.value === 'number') {
        cell.numFmt = '0.00';
        cell.alignment = { horizontal: 'right' };
      }
    });
  });

  // Add formulas for totals in row 12
  ['C', 'D', 'E', 'F', 'G', 'H'].forEach(col => {
    const cell = worksheet.getCell(`${col}12`);
    cell.value = { formula: `SUM(${col}${startRow}:${col}${startRow + organizedPayslips.length - 1})` };
    cell.numFmt = '0.00';
    cell.alignment = { horizontal: 'right' };
    cell.font = { bold: true };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  return worksheet;
}

function organizePayslips(payslips, periodType) {
  const organized = new Map();

  payslips.forEach(payslip => {
    const key = getPayslipKey(payslip, periodType);
    if (!organized.has(key)) {
      organized.set(key, {
        employeeId: payslip.employeeId,
        employeeName: payslip.employeeName,
        periods: new Map(),
        totalNPF: 0
      });
    }
    
    const entry = organized.get(key);
    const periodNum = getPeriodNumber(payslip, periodType);
    const npfAmount = payslip.payrollBreakdown.deductions.npf || 0;
    
    // Only update if this period hasn't been recorded yet or has a higher value
    if (!entry.periods.has(periodNum) || entry.periods.get(periodNum) < npfAmount) {
      entry.periods.set(periodNum, npfAmount);
      // Recalculate total NPF after updating period amount
      entry.totalNPF = Array.from(entry.periods.values()).reduce((sum, val) => sum + val, 0);
    }
  });

  return Array.from(organized.values());
}

function getPayslipKey(payslip, periodType) {
  return `${payslip.employeeId}-${periodType}`;
}

function getPeriodNumber(payslip, periodType) {
  switch (periodType) {
    case 'monthly':
      return payslip.monthNo;
    case 'fortnightly':
      return Math.ceil(payslip.weekNo / 2);
    default: // weekly
      return payslip.weekNo;
  }
}

function getColumnHeaders(periodType) {
  switch (periodType) {
    case 'monthly':
      return ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'TOTAL'];
    case 'fortnightly':
      return ['F/N 1', 'F/N 2', 'F/N 3', 'F/N 4', 'F/N 5', 'TOTAL'];
    default: // weekly
      return ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'TOTAL'];
  }
}

function generatePeriodValues(payslip, periodType) {
  const values = [];
  const maxPeriods = 5;
  
  for (let i = 1; i <= maxPeriods; i++) {
    values.push(payslip.periods.get(i) || 0);
  }
  
  return values;
}

function calculateTotalNPF(payslip) {
  return payslip.totalNPF;
}