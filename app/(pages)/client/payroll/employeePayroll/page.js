"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Download } from "lucide-react";
import Header from "@/components/breadcumb";

const PayrollDashboard = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "TestEmployer";
  const [payrolls, setPayrolls] = useState([]);

  const [empPayrolls, setEmpPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [payrollStats, setPayrollStats] = useState({
    totalEmployees: 0,
    totalPayroll: 0,
    averageSalary: 0,
  });
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  // Load tax settings from localStorage
  const taxSettings = JSON.parse(localStorage.getItem("taxSettings")) || {
    acc: { employee: 1, employer: 1 },
    npf: { employee: 10, employer: 10 },
  };
  const payeConditions = JSON.parse(localStorage.getItem("payeConditions")) || {
    Weekly: [
      { id: 1, min: 0, max: 288, rate: 0, subtract: 0 },
      { id: 2, min: 288.01, max: 481, rate: 20, subtract: 57.6 },
      {
        id: 3,
        min: 481.01,
        max: 100000000000000000000000000000000000000,
        rate: 27,
        subtract: 91.27,
      },
    ],
    Fortnightly: [
      { id: 1, min: 0, max: 576, rate: 0, subtract: 0 },
      { id: 2, min: 576.01, max: 962, rate: 20, subtract: 115.2 },
      {
        id: 3,
        min: 962.01,
        max: 100000000000000000000000000000000000000,
        rate: 27,
        subtract: 182.54,
      },
    ],
    Monthly: [
      { id: 1, min: 0, max: 1250, rate: 0, subtract: 0 },
      { id: 2, min: 1250.01, max: 2083, rate: 20, subtract: 250 },
      {
        id: 3,
        min: 2083.01,
        max: 100000000000000000000000000000000000000,
        rate: 27,
        subtract: 395.81,
      },
    ],
  };

  const [formData, setFormData] = useState({
    payroll_id: "",
    employer_id: employerId,
  });

  useEffect(() => {
    fetchPayrolls();
  }, [employerId]);

  const fetchPayrolls = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/payroll/payroll-process?employerId=${employerId}`
      );

      if (response.data.success) {
        setPayrolls(response.data.data);
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to fetch payroll periods",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePayroll = async () => {
    if (!formData.payroll_id) {
      setStatus({
        type: "error",
        message: "Please select a payroll period",
      });
      return;
    }

    try {
      setIsLoading(true);
      const empData = await axios.get(
        `/api/employees?employerId=${employerId}`
      );

      const selectedPayrollPeriod = payrolls.find(
        (p) => p.payroll_id === formData.payroll_id
      );

      // Process employee data and calculate payroll
      const processedPayroll = await processPayrollData(
        empData.data.data,
        selectedPayrollPeriod
      );

      setEmpPayrolls(processedPayroll);
      console.log("Peek A BOO", processedPayroll);

      // Calculate statistics
      const stats = calculatePayrollStats(processedPayroll);
      setPayrollStats(stats);

      setStatus({
        type: "success",
        message: "Payroll calculated successfully",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: "Error calculating payroll",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEmployeePayroll = async (
    employees,
    startDate,
    endDate,
    payrollPeriod,
    settings = {}
  ) => {
    console.log("Starting payroll calculation with:", {
      totalEmployees: employees.length,
      startDate,
      endDate,
      payrollID: payrollPeriod.payroll_id,
    });

    const payrollSettings = {
      baseHoursPerWeek: settings.baseHoursPerWeek || 40,
      overtimeMultiplier: settings.overtimeMultiplier || 1.5,
      weeklyPayMultipliers: {
        weekly: settings.weeklyMultiplier || 1,
        fortnightly: settings.fortnightlyMultiplier || 2,
        monthly: settings.monthlyMultiplier || 4.33,
      },
      maxRegularHoursPerDay: settings.maxRegularHoursPerDay || 8,
      workingDaysPerWeek: settings.workingDaysPerWeek || 5,
    };

    console.log("Payroll settings:", payrollSettings);

    const [
      allPeriodicAttendance,
      allDeductions,
      allAllowances,
      allPayrollDeductions,
      allPayrollAllowances,
    ] = await Promise.all([
      axios.get("/api/employees/periodicAttendance?employerId=" + employerId),
      axios.get("/api/employees/deduction?employerId=" + employerId),
      axios.get("/api/employees/allownce?employerId=" + employerId),
      axios.get(`/api/payroll/payrollDeduction/${payrollPeriod._id}`),
      axios.get(`/api/payroll/payrollAllownce/${payrollPeriod._id}`),
    ]);

    console.log("API responses received:", {
      // attendanceCount: allAttendance.data.length,
      periodicAttendanceCount: allPeriodicAttendance.data.data.length,
      deductionsCount: allDeductions.data.data.length,
      allowancesCount: allAllowances.data.data.length,
    });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const payPeriodDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const payPeriodWeeks = payPeriodDays / 5;
    const expectedBaseHours = payrollSettings.baseHoursPerWeek * payPeriodWeeks;

    console.log("Period calculations:", {
      start,
      end,
      payPeriodDays,
      payPeriodWeeks,
      expectedBaseHours,
    });

    const calculatePAYE = (annualSalary, type) => {
      let tax = 0;

      let remainingSalary = annualSalary;

      for (const bracket of payeConditions[type]) {
        // Check if the remainingSalary falls within the current bracket range
        if (remainingSalary > bracket.min && remainingSalary <= bracket.max) {
          // Calculate the amount within the bracket range
          const bracketAmount = remainingSalary;

          // Apply the tax calculation
          tax += bracketAmount * (bracket.rate / 100) - bracket.subtract;

          // Output for debugging
          console.log("Bracket ID:", bracket.id);
          console.log("Remaining Salary:", remainingSalary);
          console.log("Bracket Amount:", bracketAmount);
          console.log(
            "Tax applied:",
            bracketAmount * (bracket.rate / 100) - bracket.subtract
          );

          // Reduce the remaining salary by the bracketAmount
          remainingSalary -= bracketAmount;
          break; // Once a match is found, break the loop
        }
      }

      return tax;
    };

    const convertToTotalHours = (timeString) => {
      console.log("Converting time string:", timeString);
      
      // Check if timeString is just a number
      if (/^\d+$/.test(timeString)) {
        const hours = parseInt(timeString);
        console.log("Converted hours:", hours);
        return hours;
      }
      
      // Original regex for "Xh Ym" format
      const timePattern = /(\d+)h\s*(\d*)m?/;
      const match = timeString.match(timePattern);
      
      if (!match) return 0;
      
      const hours = parseInt(match[1]) || 0;
      const minutes = parseInt(match[2]) || 0;
      const totalHours = hours + minutes / 60;
      
      console.log("Converted hours:", totalHours);
      return totalHours;
    };

    const parseRate = (rateString) => {
      console.log("Parsing rate:", rateString);
      if (!rateString) return 0;
      if (rateString.includes("%")) {
        const percentage = parseFloat(rateString);
        return percentage / 100;
      }
      return parseFloat(rateString) || 0;
    };

    const calculateAdjustments = (items, baseSalary) => {
      console.log("Calculating adjustments:", { items, baseSalary });
      return items.reduce((total, item) => {
        const rate = parseRate(item.rate);
        if (item.rate.includes("%")) {
          return total + baseSalary * rate;
        }
        return total + rate;
      }, 0);
    };

    const processedEmployees = await Promise.all(
      employees.map(async (employee) => {
        console.log("Processing employee:", employee.employeeId);

        // Fetch employee attendance
        let EmployeeAttendance;
        try {
          EmployeeAttendance = await axios.get(
            `/api/users/attendance/${employee.employeeId}`
          );
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(
              `No attendance records found for employee: ${employee.employeeId}, skipping.`
            );
            return null;
          }
          throw error; // Rethrow other errors
        }

        const regularAttendance = EmployeeAttendance.data.filter((a) => {
          let DateObject = new Date(a.date).toLocaleDateString();

          return (
            a.employeeId === employee.employeeId &&
            new Date(DateObject).getTime() >= new Date(start).getTime() &&
            new Date(DateObject).getTime() <= new Date(end).getTime() &&
            a.status === "Approved"
          );
        });

        const periodicAttendance =
             allPeriodicAttendance.data.data.filter((a) => {
                let startDate = new Date(a.dateRange.split(" to ")[0]).toLocaleDateString();
                let endDate = new Date(a.dateRange.split(" to ")[1]).toLocaleDateString();

                console.log("Date Object Start: ", startDate);
                console.log("Date Object Employee: ", a.employeeId);
                console.log("Date Object End: ", endDate);


                return( (pa) =>
                  pa.employeeId === employee.employeeId &&
                new Date(startDate).getTime() >= new Date(start).getTime() &&
                new Date(endDate).getTime() <= new Date(end).getTime() &&
                  pa.status === "Approved")
              })
          ;

        console.log("Attendance records:", {
          regularCount: regularAttendance.length,
          periodicCount: periodicAttendance.length,
        });

        if (regularAttendance.length === 0 && periodicAttendance.length === 0) {
          console.log(
            "No attendance records found for employee:",
            employee.employeeId
          );
          return null;
        }

        let totalWorkHours = 0;
        let overtimeHours = 0;

        if (regularAttendance.length > 0) {
          regularAttendance.forEach((att) => {
            // const DateObject = new Date(att.date).toLocaleDateString();
            const dailyRegularHours =
              // Math.min(
              convertToTotalHours(att.totalWorkingHours) || 0;
            // payrollSettings.maxRegularHoursPerDay
            // );
            console.log("Daily Hours: ", dailyRegularHours);
            const dailyOvertimeHours =
              Math.max(
                0,
                (convertToTotalHours(att.totalWorkingHours) || 0) -
                  payrollSettings.baseHoursPerWeek
              ) + (att.overtime_hours || 0);
            console.log("Daily Hours: ", dailyOvertimeHours);

            totalWorkHours += dailyRegularHours;
            overtimeHours += dailyOvertimeHours;
          });
        } else if (periodicAttendance.length > 0) {
          console.log("Periodic Attendance: ", periodicAttendance);
          periodicAttendance.forEach((pa) => {


            const hours =  pa.employeeId === employee.employeeId && pa.status === "Approved" &&
            convertToTotalHours(pa.totalWorkingHours);
            console.log("Periodic Hours: ", hours);
            console.log("Periodic Hours Employee: ", pa.employeeId);

            const periodicBaseHours = Math.min(hours, expectedBaseHours);
            const periodicOvertime = Math.max(0, hours - expectedBaseHours);

            totalWorkHours += periodicBaseHours;
            overtimeHours += periodicOvertime;
          });
        }

        console.log("Work hours calculated:", {
          totalWorkHours,
          overtimeHours,
        });

        let baseSalary = 0;
        let hourlyRate = 0;

        if (employee.payType === "SALARY") {
          let basePayMultiplier =
            payPeriodDays <= 7
              ? payrollSettings.weeklyPayMultipliers.weekly
              : payPeriodDays <= 14
              ? payrollSettings.weeklyPayMultipliers.fortnightly
              : payrollSettings.weeklyPayMultipliers.monthly;

          baseSalary = (employee.ratePerHour || 0) * basePayMultiplier;
          hourlyRate = employee.ratePerHour / payrollSettings.baseHoursPerWeek;
        } 
        else if (employee.payType === "HOUR") {
          hourlyRate = employee.ratePerHour || 0;
          const regularHours = Math.min(totalWorkHours, expectedBaseHours);
          console.log("Regular Hours:", regularHours);
          baseSalary = regularHours * hourlyRate;
        }

        console.log("Salary calculations:", { baseSalary, hourlyRate });

        const employeeDeductions = allDeductions.data.data.filter((d) =>
          employee.deductions.includes(d._id)
        );
        const employeeAllowances = allAllowances.data.data.filter((a) =>
          employee.allownces.includes(a._id)
        );
        const employeePayrollDeductions = allPayrollDeductions.data.data.filter(
          (d) => d.employeeId === employee._id
        );
        const employeePayrollAllowances = allPayrollAllowances.data.data.filter(
          (a) => a.employeeId === employee._id
        );

        console.log("Employee adjustments:", {
          deductionsCount: employeeDeductions.length,
          allowancesCount: employeeAllowances.length,
          payrollDeductionsCount: employeePayrollDeductions.length,
          payrollAllowancesCount: employeePayrollAllowances.length,
        });

        // Calculate monthly equivalent for PAYE
        // const monthlyEquivalent = baseSalary * 12;
        const monthlyEquivalent = baseSalary;
        const payePeriodFactor = payPeriodDays / 30; // Adjust PAYE for pay period

        // Calculate PAYE
        const annualPAYE = calculatePAYE(
          monthlyEquivalent,
          employee.payFrequency
        );
        // const periodPAYE = (annualPAYE / 12) * payePeriodFactor;
        const periodPAYE = annualPAYE;

        // Calculate ACC
        const accEmployee = baseSalary * (taxSettings.acc.employee / 100);
        const accEmployer = baseSalary * (taxSettings.acc.employer / 100);

        // Calculate NPF
        const npfEmployee = baseSalary * (taxSettings.npf.employee / 100);
        const npfEmployer = baseSalary * (taxSettings.npf.employer / 100);

        const statutoryDeductions = periodPAYE + accEmployee + npfEmployee;
        const totalDeductions =
          statutoryDeductions +
          calculateAdjustments(
            [...employeeDeductions, ...employeePayrollDeductions],
            baseSalary
          );
        const totalAllowances = calculateAdjustments(
          [...employeeAllowances, ...employeePayrollAllowances],
          baseSalary
        );

        const overtimeRate = hourlyRate * payrollSettings.overtimeMultiplier;
        const overtimePay = overtimeHours * overtimeRate;

        const netPayable =
          baseSalary + totalAllowances + overtimePay - totalDeductions;

        console.log("Final calculations:", {
          totalDeductions,
          totalAllowances,
          overtimePay,
          netPayable,
        });

        return {
          employeeId: employee.employeeId,
          employeeName: employee.firstName,
          employeeEmail: employee.emailAddress,
          payType: employee.payType,
          monthNo: payrollPeriod.month_no,
          weekNo: payrollPeriod.week_no,
          year: payrollPeriod.year,
          payPeriodDetails: {
            startDate: start,
            endDate: end,
            totalDays: payPeriodDays,
            expectedBaseHours: expectedBaseHours,
          },
          workDetails: {
            totalWorkHours,
            overtimeHours,
            hourlyRate,
            overtimeRate,
          },
          payrollBreakdown: {
            baseSalary,
            allowances: totalAllowances,
            deductions: {
              paye: periodPAYE,
              acc: accEmployee,
              npf: npfEmployee,
              other: totalDeductions - statutoryDeductions,
              total: totalDeductions,
            },
            employerContributions: {
              acc: accEmployer,
              npf: npfEmployer,
              total: accEmployer + npfEmployer,
            },
            overtimePay,
            netPayable,
          },
          settings: {
            ...payrollSettings,
            tax: taxSettings,
            payeBrackets: payeConditions,
          },
        };
      })
    );

    const validPayrolls = processedEmployees.filter(
      (employee) => employee !== null
    );
    console.log(
      `Processed ${validPayrolls.length} out of ${employees.length} employees`
    );

    return validPayrolls;
  };

  const processPayrollData = async (employees, payrollPeriod) => {
    const startDate = new Date(payrollPeriod.date_from);
    const endDate = new Date(payrollPeriod.date_to);
    console.log("Apyroll Detail payroll Datas: ", startDate);

    // ... existing payroll calculation logic ...
    // Enhanced with more detailed calculations
    const payrollDetails = await calculateEmployeePayroll(
      employees,
      startDate.toLocaleDateString(),
      endDate.toLocaleDateString(),
      payrollPeriod
    );
    console.log("Apyroll Details: ", payrollDetails);
    return payrollDetails;
  };

  const calculatePayrollStats = (payrollData) => {
    const totalEmployees = payrollData.length;
    const totalPayroll = payrollData.reduce(
      (sum, emp) => sum + emp.payrollBreakdown.netPayable,
      0
    );
    const averageSalary = totalPayroll / totalEmployees;

    return {
      totalEmployees,
      totalPayroll,
      averageSalary,
    };
  };

  const approvePayroll = async () => {
    try {
      setIsLoading(true);
      const approvePromises = empPayrolls.map((payroll) =>
        axios.post("/api/payroll/payslip", {
          ...payroll,
          payrollId: formData.payroll_id,
          employerId,
        })
      );

      await Promise.all(approvePromises);
      setStatus({
        type: "success",
        message: "Payroll approved successfully",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to approve payroll",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header heading="Payroll Management" />

      <div className="container mx-auto p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Employees</CardTitle>
              <CardDescription>Current pay period</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {payrollStats.totalEmployees}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Payroll</CardTitle>
              <CardDescription>Current pay period</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${payrollStats.totalPayroll.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Salary</CardTitle>
              <CardDescription>Per employee</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${payrollStats.averageSalary.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Messages */}
        {status.type && (
          <Alert
            className={`mb-6 ${
              status.type === "error" ? "bg-red-50" : "bg-green-50"
            }`}
          >
            <AlertCircle
              className={
                status.type === "error" ? "text-red-600" : "text-green-600"
              }
            />
            <AlertTitle>
              {status.type === "error" ? "Error" : "Success"}
            </AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList>
            <TabsTrigger value="generate">Generate Payroll</TabsTrigger>
            <TabsTrigger value="history">Payroll History</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle>Generate Payroll</CardTitle>
                <CardDescription>
                  Select a payroll period to process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label htmlFor="payroll_id">Payroll Period</Label>
                      <Select
                        onValueChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            payroll_id: value,
                          }));
                          setSelectedPayroll(
                            payrolls.find((p) => p.payroll_id === value)
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
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
                    <Button
                      onClick={calculatePayroll}
                      disabled={isLoading || !formData.payroll_id}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing
                        </>
                      ) : (
                        "Calculate Payroll"
                      )}
                    </Button>
                  </div>

                  {/* Payroll Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Employee</TableHead>
                          <TableHead>Work Hours</TableHead>
                          <TableHead>Overtime</TableHead>
                          <TableHead>Pay Rate</TableHead>
                          <TableHead>Email Address</TableHead>
                          <TableHead>Allowances</TableHead>
                          <TableHead>PAYE</TableHead>
                          <TableHead>NPF</TableHead>
                          <TableHead>ACC</TableHead>
                          <TableHead>Net Payable</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {empPayrolls.length > 0 ? (
                          empPayrolls.map((payroll, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {payroll.employeeName}
                              </TableCell>
                              <TableCell>
                                {payroll.workDetails.totalWorkHours}
                              </TableCell>
                              <TableCell>
                                {+payroll.workDetails.overtimeHours.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                $
                                {
                                  +payroll.payrollBreakdown.baseSalary.toFixed(
                                    2
                                  )
                                }
                              </TableCell>
                              <TableCell>
                                {payroll.employeeEmail}
                               
                              </TableCell>
                              <TableCell>
                                $
                                {
                                  +payroll.payrollBreakdown.allowances.toFixed(
                                    2
                                  )
                                }
                              </TableCell>
                              <TableCell>
                                $
                                {
                                  +payroll.payrollBreakdown.deductions.paye.toFixed(
                                    2
                                  )
                                }
                              </TableCell>
                              <TableCell>
                                $
                                {
                                  +payroll.payrollBreakdown.deductions.npf.toFixed(
                                    2
                                  )
                                }
                              </TableCell>
                              <TableCell>
                                $
                                {
                                  +payroll.payrollBreakdown.deductions.acc.toFixed(
                                    2
                                  )
                                }
                              </TableCell>
                              <TableCell className="font-bold">
                                $
                                {
                                  +payroll.payrollBreakdown.netPayable.toFixed(
                                    2
                                  )
                                }
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              No payroll data available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {empPayrolls.length > 0 && (
                    <div className="flex justify-end gap-4">
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                      <Button onClick={approvePayroll} disabled={isLoading}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve Payroll
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Payroll History</CardTitle>
                <CardDescription>View past payroll records</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Add payroll history content here */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PayrollDashboard;
