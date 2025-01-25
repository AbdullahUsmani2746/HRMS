"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/breadcumb";

// Mock data
const mockEmployeeData = [
  {
    firstName: "Taualai",
    middleName: "John",
    surname: "Fonoti",
    employeeId: "001-0001",
    payType: "SALARY",
    ratePerHour: 600,
    standardWorkHours: 40,

    allowances: [
      { type: "Transport", amount: 50 },
      { type: "Meal", amount: 30 },
    ],
    deductions: [
      { type: "Tax", amount: "2%" },
      { type: "Insurance", amount: 75 },
    ],
  },
  {
    firstName: "Sarah",
    middleName: "Ann",
    surname: "Lee",
    employeeId: "002-0002",
    payType: "HOURLY",
    ratePerHour: 30,
    standardWorkHours: 40,
    allowances: [{ type: "Communication", amount: 100 }],
    deductions: [
      { type: "Tax", amount: 150 },
      { type: "Health Insurance", amount: 50 },
    ],
  },
];

const mockPayrolls = [
  {
    payroll_id: "pay001",
    date_from: "2024-02-29",
    date_to: "2024-03-06",
    month_no: 3,
    year: 2024,
  },
];

const mockAttendanceData = [
  {
    employeeId: "001-0002",
    date: "2024-02-29",
    totalWorkingHours: 9.40,
  },
  {
    employeeId: "001-0002",
    date: "2024-03-01",
    totalWorkingHours: 10.00,
  },

  {
    employeeId: "001-0002",
    date: "2024-03-05",
    totalWorkingHours: 9.70,
  },

  {
    employeeId: "001-0002",
    date: "2024-03-06",
    totalWorkingHours: 7.20,
  },
  
];

const Payroll = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "TestEmployer";
  const [payrolls, setpayrolls] = useState([]);

  const [formData, setFormData] = useState({
    payroll_id: "",
    employer_id: employerId,
  });

  const [empPayrolls, setEmpPayrolls] = useState([]);


  //Function to getch Payroll
  useEffect(() => {
  const fetchPayrolls = async () => {
    try {
      const response = await axios.get(`/api/payroll/payroll-process`);
      if (response.data.success) {
        setpayrolls(response.data.data);
        return response.data.data;

      } else {
        console.error("Error fetching payrolls:", response.data.error);
        return [];
      }
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  }
   fetchPayrolls();
  }, []);
  // Function to fetch allowances
  const fetchAllowances = async (allowanceIds) => {
    try {
      const response = await axios.get(
        `/api/payroll/allownces-deductions?allowances=${allowanceIds.join(",")}`
      );
      if (response.data.success) {
        return response.data.data.allowances;
      } else {
        console.error("Error fetching allowances:", response.data.error);
        return [];
      }
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  };

  // Function to fetch deductions
  const fetchDeductions = async (deductionIds) => {
    try {
      const response = await axios.get(
        `/api/payroll/allownces-deductions?deductions=${deductionIds.join(",")}`
      );
      if (response.data.success) {
        return response.data.data.deductions;
      } else {
        console.error("Error fetching deductions:", response.data.error);
        return [];
      }
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  };

  const calculatePayroll = async () => {
    if (!formData.payroll_id) {
      alert("Please select a payroll period first.");
      return;
    }

    const empData = await axios.get(`/api/employees?employerId=${employerId}`);
    const mockData = empData.data.data;
    console.log(mockData);

    const selectedPayroll = payrolls.find(
      (p) => p.payroll_id === formData.payroll_id
    );

    if (!selectedPayroll) {
      alert("Invalid payroll ID selected.");
      return;
    }

    const startDate = new Date(selectedPayroll.date_from);
    const endDate = new Date(selectedPayroll.date_to);
    const weekNo = selectedPayroll.week_no;
    const year = selectedPayroll.year;
    const monthNo = selectedPayroll.month_no;

    const generatedPayrolls = await Promise.all(
      mockData.map(async (employee) => {
        console.log("Employee:", employee.firstName);
        const attendance = mockAttendanceData.filter(
          (entry) =>
            entry.employeeId === employee.employeeId &&
            new Date(entry.date) >= startDate &&
            new Date(entry.date) <= endDate
        );

        let totalWorkHours = attendance.reduce(
          (sum, entry) => sum + entry.totalWorkingHours,
          0
        );
        let overtimeHours = Math.max(0, totalWorkHours - 40);

        let grossPay = 0;
        let workingDays = 0;
        let dailySalary = 0;
        let salary = employee.ratePerHour;

        if (employee.payType === "SALARY") {
          // Monthly salary; distribute over working days

          if (employee.payFrequency === "WEEK") {
            workingDays =
              Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) ;

            dailySalary = employee.ratePerHour / 7; // Assuming 30 days per month
            grossPay = dailySalary * workingDays;
          } else {
            workingDays =
              Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
            dailySalary = employee.ratePerHour / 30; // Assuming 30 days per month
            grossPay = dailySalary * workingDays;
          }
        } else if (employee.payType === "HOUR") {
          // Hourly pay
          grossPay = totalWorkHours * employee.ratePerHour;
        }

        const overtimePay = overtimeHours * employee.ratePerHour * 1.5;

        // Check if allowances are available
        let totalAllowances = 0;
        if (employee.allownces && employee.allownces.length > 0) {
          const allowances = await fetchAllowances(employee.allownces);
          totalAllowances = allowances.reduce(
            (sum, allowance) => sum + allowance.allownce_rate,
            0
          );
        }

        // Check if deductions are available
        let totalDeductions = 0;
        if (employee.deductions && employee.deductions.length > 0) {
          const deductions = await fetchDeductions(employee.deductions);
          totalDeductions = deductions.reduce((sum, deduction) => {
            if (
              typeof deduction.deduction_rate === "string" &&
              deduction.deduction_rate.includes("%")
            ) {
              // Percentage deduction
              const percentage = parseFloat(
                deduction.deduction_rate.replace("%", "")
              );
              return sum + (percentage / 100) * (grossPay + totalAllowances);
            } else {
              // Fixed amount deduction
              return sum + deduction.deduction_rate;
            }
          }, 0);
        }

        console.log("Total deductions:", totalDeductions);
        const netPayable =
          grossPay + overtimePay + totalAllowances - totalDeductions;

        return {
          employeeId: employee.employeeId,
          employeeName: `${employee.firstName} ${employee.surname}`,
          totalWorkHours,
          overtimeHours,
          netPayable,
          grossPay,
          workingDays,
          salary,
          date_from: endDate,
          date_to: startDate,
          year: year,
          month_no: monthNo,
          week_no: weekNo,
          deductions: totalDeductions,
          allowances: totalAllowances,
        };
      })
    );

    setEmpPayrolls(generatedPayrolls);
  };

  return (
    <>
      <Header heading="Payroll Generation" />
      <div>
        <Dialog>
        <div className="flex justify-end">

          <DialogTrigger asChild>
              <Button className="m-4">Generate Payroll</Button>
          </DialogTrigger>
          </div>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payroll</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="payroll_id">Payroll</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, payroll_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Payroll" />
                  </SelectTrigger>
                  <SelectContent>
                    {payrolls.map((payroll) => (
                      <SelectItem
                        key={payroll.payroll_id}
                        value={payroll.payroll_id}
                      >
                        {`${new Date(
                          payroll.date_from
                        ).toLocaleDateString()} - ${new Date(
                          payroll.date_to
                        ).toLocaleDateString()}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button onClick={calculatePayroll}>Generate Payroll</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="px-4">
          <Table className="shadow-md rounded-lg border-separate">
            <TableHeader>
              <TableRow className="bg-foreground text-left">
                <TableHead className="px-4 text-white font-bold">
                  Employee
                </TableHead>
                <TableHead className="px-4 text-white font-bold">
                  Work Hours
                </TableHead>
                <TableHead className="px-4 text-white font-bold">
                  Overtime Hours
                </TableHead>
                <TableHead className="px-4 text-white font-bold">
                  Salary / RPH
                </TableHead>
                <TableHead className="px-4 text-white font-bold">
                  Gross Pay
                </TableHead>
               
                <TableHead className="px-4 text-white font-bold">
                  Net Payable
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
  {empPayrolls.length > 0 ? (
    empPayrolls.map((payroll, index) => (
      <TableRow key={index}  className="bg-background shadow-lg rounded-lg border-separate"
>
        <TableCell className="px-4">{payroll.employeeName}</TableCell>
        <TableCell className="px-4">{payroll.totalWorkHours}</TableCell>
        <TableCell className="px-4">{payroll.overtimeHours}</TableCell>
        <TableCell className="px-4">{payroll.salary.toFixed(2)}</TableCell>
        <TableCell className="px-4">{payroll.grossPay.toFixed(2)}</TableCell>
        <TableCell className="px-4 font-bold">
          ${payroll.netPayable.toFixed(2)}
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={8} className="text-center">
        No payroll data available. Generate payroll to view details.
      </TableCell>
    </TableRow>
  )}
</TableBody>
          </Table>
          <div className="flex justify-end mt-4">
              <Button
                onClick={async () => {
                  try {
                    const approvePromises = empPayrolls.map((payroll) =>
                      axios.post("/api/payroll/payslip", {
                        ...payroll,
                        payrollId: formData.payroll_id,
                        employerId,
                      })
                    );

                    await Promise.all(approvePromises);

                    alert("Payroll approved successfully!");
                  } catch (error) {
                    console.error("Error approving payroll:", error);
                    alert("An error occurred while approving payroll.");
                  }
                }}
              >
                Approve Payroll
              </Button>
            </div>
        </div>

        {/* <div>
        {mockEmployeeData.map((employee, index) => (
          <div key={index}>
            {Object.entries(employee).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong> {JSON.stringify(value)}
              </div>
            ))}
          </div>
        ))}
      </div> */}
      </div>
    </>
  );
};

export default Payroll;
