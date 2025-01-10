"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { useState } from "react";
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
    date_from: "2024-01-01",
    date_to: "2024-01-08",
    month_no: 1,
    year: 2024,
  },
];

const mockAttendanceData = [
  {
    employeeId: "001-0001",
    date: "2024-01-01",
    totalWorkingHours: 8,
  },
  {
    employeeId: "001-0001",
    date: "2024-01-02",
    totalWorkingHours: 9,
  },
  {
    employeeId: "002-0002",
    date: "2024-01-01",
    totalWorkingHours: 7,
  },
  {
    employeeId: "002-0002",
    date: "2024-01-02",
    totalWorkingHours: 8,
  },
];

const Payroll = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "TestEmployer";

  const [formData, setFormData] = useState({
    payroll_id: "",
    employer_id: employerId,
  });

  const [empPayrolls, setEmpPayrolls] = useState([]);

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

    const selectedPayroll = mockPayrolls.find(
      (p) => p.payroll_id === formData.payroll_id
    );

    if (!selectedPayroll) {
      alert("Invalid payroll ID selected.");
      return;
    }

    const startDate = new Date(selectedPayroll.date_from);
    const endDate = new Date(selectedPayroll.date_to);

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
        } else if (employee.payType === "HOURLY") {
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
          employeeId: `${employee.firstName} ${employee.surname}`,
          totalWorkHours,
          overtimeHours,
          netPayable,
          grossPay,
          dailySalary,
          workingDays,
          salary
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
                    {mockPayrolls.map((payroll) => (
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
                  Salary
                </TableHead>
                <TableHead className="px-4 text-white font-bold">
                  Gross Pay
                </TableHead>
                <TableHead className="px-4 text-white font-bold">
                  Daily Salary
                </TableHead>
                <TableHead className="px-4 text-white font-bold">
                  Working Days
                </TableHead>
                <TableHead className="px-4 text-white font-bold">
                  Net Payable
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empPayrolls.map((payroll, index) => (
                <TableRow
                  key={index}
                  className="bg-background shadow-lg rounded-lg border-separate"
                >
                  <TableCell className="px-4">{payroll.employeeId}</TableCell>
                  <TableCell className="px-4">
                    {payroll.totalWorkHours}
                  </TableCell>
                  <TableCell className="px-4">
                    {payroll.overtimeHours}
                  </TableCell>
                  <TableCell className="px-4">{payroll.salary}</TableCell>

                  <TableCell className="px-4">{payroll.grossPay}</TableCell>
                  <TableCell className="px-4">{payroll.dailySalary}</TableCell>
                  <TableCell className="px-4">{payroll.workingDays}</TableCell>

                  <TableCell className="px-4">
                    ${parseFloat(payroll.netPayable.toFixed(2))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
