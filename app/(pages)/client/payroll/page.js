// app/payroll/page.js
"use client"
import { useState, useEffect } from "react";
import Header from "@/components/breadcumb";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import LoadingSpinner from "@/components/spinner";

const PayrollPageCompoenent = ()=> {

    const [isLoading, setIsLoading] = useState(false);
    const [payrollData, setPayrollData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [leaves, setLeaves] = useState([]);
    // const [deductions, setDeductions] = useState([]);
    const [allowances, setAllowances] = useState([]);
  
    useEffect(() => {
      fetchPayrollData(selectedDate);
    }, [selectedDate]);
  
    const fetchPayrollData = async (date) => {
      setIsLoading(true);
      try {
        // Replace with your API endpoint
        const response = await fetch(`/api/payroll?date=${date.toISOString()}`);
        const data = await response.json();
        setPayrollData(data.payroll || []);
        setLeaves(data.leaves || []);
        setDeductions(data.deductions || []);
        setAllowances(data.allowances || []);
      } catch (error) {
        console.error("Error fetching payroll data:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
  const otherPayments = [
    
    {
        payroll_id: 1,
        month: "January",
        week_no: 2,
        employee_id: "EMP001",
        employer_id: "EMPLOYER001",
        allowance_id: "ALLOW001",
        allowance_per: 10,
        allowance_amount: 200,
      },
    // Add more rows as needed
  {
    payroll_id: 1,
    month: "January",
    week_no: 2,
    employee_id: "EMP001",
    employer_id: "EMPLOYER001",
    allowance_id: "ALLOW001",
    allowance_per: 10,
    allowance_amount: 200,
  },{
    payroll_id: 1,
    month: "January",
    week_no: 2,
    employee_id: "EMP001",
    employer_id: "EMPLOYER001",
    allowance_id: "ALLOW001",
    allowance_per: 10,
    allowance_amount: 200,
  },{
    payroll_id: 1,
    month: "January",
    week_no: 2,
    employee_id: "EMP001",
    employer_id: "EMPLOYER001",
    allowance_id: "ALLOW001",
    allowance_per: 10,
    allowance_amount: 200,
  },{
    payroll_id: 1,
    month: "January",
    week_no: 2,
    employee_id: "EMP001",
    employer_id: "EMPLOYER001",
    allowance_id: "ALLOW001",
    allowance_per: 10,
    allowance_amount: 200,
  },
];

  const deductions = [
    {
      payroll_id: 1,
      month: "January",
      week_no: 2,
      employee_id: "EMP001",
      employer_id: "EMPLOYER001",
      deduction_id: "DEDUCT001",
      deduction_per: 5,
      deduction_amount: 100,
    },
    {
        payroll_id: 1,
        month: "January",
        week_no: 2,
        employee_id: "EMP001",
        employer_id: "EMPLOYER001",
        deduction_id: "DEDUCT001",
        deduction_per: 5,
        deduction_amount: 100,
      },
      {
        payroll_id: 1,
        month: "January",
        week_no: 2,
        employee_id: "EMP001",
        employer_id: "EMPLOYER001",
        deduction_id: "DEDUCT001",
        deduction_per: 5,
        deduction_amount: 100,
      },
      {
          payroll_id: 1,
          month: "January",
          week_no: 2,
          employee_id: "EMP001",
          employer_id: "EMPLOYER001",
          deduction_id: "DEDUCT001",
          deduction_per: 5,
          deduction_amount: 100,
        },
        {
            payroll_id: 1,
            month: "January",
            week_no: 2,
            employee_id: "EMP001",
            employer_id: "EMPLOYER001",
            deduction_id: "DEDUCT001",
            deduction_per: 5,
            deduction_amount: 100,
          },
          {
              payroll_id: 1,
              month: "January",
              week_no: 2,
              employee_id: "EMP001",
              employer_id: "EMPLOYER001",
              deduction_id: "DEDUCT001",
              deduction_per: 5,
              deduction_amount: 100,
            },
              

      
      

    // Add more rows as needed
  ];

  return (
    <>
    <Header heading="Payroll Details" />
    {isLoading ? (
        <LoadingSpinner />
      ) : (   
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="transition-width duration-300 flex-1 p-6">
              <div className="p-4">
               
      {/* Other Payments Table */}
      <section>
        <h2 className="text-xl font-bold mb-4">Employee Payroll Detail - Other Payments</h2>
        <Table className="shadow-md rounded-lg border-separate">
          <TableHeader>
            <TableRow className="bg-foreground text-left">
              <TableHead className="px-4 py-2 font-semibold text-white" >Payroll ID</TableHead>
              <TableHead className="px-4 py-2 font-semibold text-white" >Month</TableHead>
              <TableHead className="px-4 py-2 font-semibold text-white" >Week No</TableHead>
              <TableHead className="px-4 py-2 font-semibold text-white" >Employee ID</TableHead>
              <TableHead className="px-4 py-2 font-semibold text-white" >Employer ID</TableHead>
              <TableHead className="px-4 py-2 font-semibold text-white" >Allownce ID</TableHead>
              <TableHead className="px-4 py-2 font-semibold text-white" >Allownce %</TableHead>
              <TableHead className="px-4 py-2 font-semibold text-white" >Allownce Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {otherPayments.map((payment, index) => (
              <TableRow key={index}>
                <TableCell className="px-4">{payment.payroll_id}</TableCell>
                <TableCell className="px-4">{payment.month}</TableCell>
                <TableCell className="px-4">{payment.week_no}</TableCell>
                <TableCell className="px-4">{payment.employee_id}</TableCell>
                <TableCell className="px-4">{payment.employer_id}</TableCell>
                <TableCell className="px-4">{payment.allowance_id}</TableCell>
                <TableCell className="px-4">{payment.allowance_per}</TableCell>
                <TableCell className="px-4">{payment.allowance_amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* Deductions Table */}
      <section>
        <h2 className="text-xl font-bold mb-4">Employee Payroll Detail - Deductions</h2>
        <Table className="shadow-md rounded-lg border-separate">
          <TableHeader>
            <TableRow className="bg-foreground text-left">
              <TableHead className="px-4 py-2 font-semibold text-white" >Payroll ID</TableHead>
              <TableHead className="px-4 py-2 font-semibold text-white" >Month</TableHead>
              <TableHead className="px-4 py-2 font-semibold text-white" >Week No</TableHead>
              <TableHead className="px-4 py-2 font-semibold text-white" >Employee ID</TableHead>
              <TableHead className="px-4 py-2 font-semibold text-white" >Employer ID</TableHead>
              <TableHead className="px-4 py-2 font-semibold text-white" >Deduction ID</TableHead>
              <TableHead className="px-4 py-2 font-semibold text-white" >Deduction %</TableHead>
              <TableHead className="px-4 py-2 font-semibold text-white" >Deduction Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deductions.map((deduction, index) => (
              <TableRow key={index}>
                <TableCell className="px-4">{deduction.payroll_id}</TableCell>
                <TableCell className="px-4">{deduction.month}</TableCell>
                <TableCell className="px-4">{deduction.week_no}</TableCell>
                <TableCell className="px-4">{deduction.employee_id}</TableCell>
                <TableCell className="px-4">{deduction.employer_id}</TableCell>
                <TableCell className="px-4">{deduction.deduction_id}</TableCell>
                <TableCell className="px-4">{deduction.deduction_per}</TableCell>
                <TableCell className="px-4">{deduction.deduction_amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
    </div>
    </div>
    
    )}
    </>
  );
};

export default PayrollPageCompoenent ;
