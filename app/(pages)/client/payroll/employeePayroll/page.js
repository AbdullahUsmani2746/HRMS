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
// Add these imports at the top
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, AlertCircle, CheckCircle2, Download,FileSpreadsheet, HelpCircle, Trash2, LockOpen , Search, ArrowUpDown, Skeleton} from "lucide-react";
import Header from "@/components/breadcumb";

// Add these imports at the top
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

const PayrollDashboard = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "TestEmployer";
  const [payrolls, setPayrolls] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState({});
  const [employeesWithIssues, setEmployeesWithIssues] = useState([]);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [empPayrolls, setEmpPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [payrollStats, setPayrollStats] = useState({
    totalEmployees: 0,
    totalPayroll: 0,
    averageSalary: 0,
  });

// Add state variables near other state declarations
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
const [searchTerm, setSearchTerm] = useState("");
const [selectedStatus, setSelectedStatus] = useState("all");



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

  // Add filtered payrolls calculation
const filteredPayrolls = payrolls.filter(payroll => {
  const matchesSearch = payroll.payroll_id.toString().includes(searchTerm) ||
    new Date(payroll.date_from).toLocaleDateString().includes(searchTerm) ||
    new Date(payroll.date_to).toLocaleDateString().includes(searchTerm);
  
  const matchesStatus = selectedStatus === "all" || 
    payroll.status.toLowerCase() === selectedStatus.toLowerCase();
  
  return matchesSearch && matchesStatus;
});

  // Pagination calculations
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = filteredPayrolls.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);



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
      setStatus({ type: "error", message: "Please select a payroll period" });
      return;
    }
  
    try {
      setIsLoading(true);
      const [empData, payrollData] = await Promise.all([
        axios.get(`/api/employees?employerId=${employerId}`),
        axios.get(`/api/payroll/payroll-process/${formData.payroll_id}`)
      ]);
  
      const selectedPayrollPeriod = payrollData.data.data;
      const processedEmployees = new Set(selectedPayrollPeriod.processedEmployees || []);
  
      // Filter out already processed employees
      const unprocessedEmployees = empData.data.data.filter(
        emp => !processedEmployees.has(emp.employeeId)
      );
  
      const processedPayroll = await processPayrollData(
        unprocessedEmployees,
        selectedPayrollPeriod
      );
      setEmpPayrolls(processedPayroll);
      console.log("Peek A BOO", processedPayroll);

      // Calculate statistics
      const stats = calculatePayrollStats(processedPayroll);
      setPayrollStats(stats);

      const initialSelection = {};
processedPayroll.forEach(employee => {
  initialSelection[employee.employeeId] = true; // All selected by default
});
setSelectedEmployees(initialSelection);

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

  // Add this function right after the calculatePayroll function
const recalculateSelectedPayroll = async () => {
  if (!formData.payroll_id) {
    setStatus({
      type: "error",
      message: "Please select a payroll period",
    });
    return;
  }

  try {
    setIsLoading(true);
    
    // Get only the employees that need recalculation (previously unchecked due to issues)
    const employeesToRecalculate = employeesWithIssues.filter(id => !selectedEmployees[id]);
    
    if (employeesToRecalculate.length === 0) {
      setStatus({
        type: "info",
        message: "No employees selected for recalculation",
      });
      setIsLoading(false);
      return;
    }
    
    // Get the full employee data for the selected IDs
    const empData = await axios.get(`/api/employees?employerId=${employerId}`);
    const filteredEmployees = empData.data.data.filter(emp => 
      employeesToRecalculate.includes(emp.employeeId)
    );

    const selectedPayrollPeriod = payrolls.find(
      (p) => p.payroll_id === formData.payroll_id
    );

    // Process only the selected employees
    const recalculatedPayrolls = await processPayrollData(
      filteredEmployees,
      selectedPayrollPeriod
    );
    
    // Merge the recalculated payrolls with existing ones
    const updatedPayrolls = [...empPayrolls];
    
    recalculatedPayrolls.forEach(newPayroll => {
      const existingIndex = updatedPayrolls.findIndex(
        p => p.employeeId === newPayroll.employeeId
      );
      
      if (existingIndex >= 0) {
        updatedPayrolls[existingIndex] = newPayroll;
      } else {
        updatedPayrolls.push(newPayroll);
      }
    });
    
    setEmpPayrolls(updatedPayrolls);
    
    // Update selections to include recalculated employees
    const newSelections = {...selectedEmployees};
    recalculatedPayrolls.forEach(p => {
      const hasValidHours = p.workDetails.totalWorkHours > 0;
      const hasValidPay = p.payrollBreakdown.netPayable > 0;
      const isDataComplete = hasValidHours && hasValidPay;
      
      newSelections[p.employeeId] = isDataComplete;
    });
    setSelectedEmployees(newSelections);
    
    // Update statistics
    const stats = calculatePayrollStats(updatedPayrolls);
    setPayrollStats(stats);

    setStatus({
      type: "success",
      message: `Recalculated payroll for ${recalculatedPayrolls.length} employees`,
    });
  } catch (error) {
    console.error("Recalculation error:", error);
    setStatus({
      type: "error",
      message: "Error recalculating payroll",
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
        let EmployeeAttendance = [];
        try {
          EmployeeAttendance = await axios.get(
            `/api/users/attendance/${employee.employeeId}`
          );
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(
              `No attendance records found for employee: ${employee.employeeId}, skipping.`
            );
            // return null;
          }
          // throw error; // Rethrow other errors
        }

        const regularAttendance = EmployeeAttendance.length > 0 && EmployeeAttendance.data.filter((a) => {
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

                console.log("=====================================================")
                console.log("Date Object End: ", startDate);
                console.log("Date Object Start: ",  new Date(startDate).getTime());
                console.log("Date Object Start Compare: ",  new Date(start).getTime());
                console.log("Date Object Employee: ", a.employeeId);
                console.log("Date Object Employee: ", employee.employeeId);
                
                console.log("Date Object End: ", endDate);
                console.log("Date Object Start: ",  new Date(endDate).getTime());
                console.log("Date Object Start Compare: ",  new Date(end).getTime());

                console.log("Retrun Statement: ", (
                  a.employeeId === employee.employeeId &&
                  new Date(startDate).getTime() >= new Date(start).getTime() &&
                  new Date(endDate).getTime() <= new Date(end).getTime() &&
                    a.status === "Approved"
                ));
                console.log("=====================================================")


                return( 
                  a.employeeId === employee.employeeId &&
                new Date(startDate).getTime() >= new Date(start).getTime() &&
                new Date(endDate).getTime() <= new Date(end).getTime() &&
                  a.status === "Approved")
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
        } 
        
       if (periodicAttendance.length > 0) {
          console.log("Periodic Attendance: ", periodicAttendance);
          periodicAttendance.forEach((pa) => {

            console.log("employee ID:  ",employee.employeeId)

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

    

  const handleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };
  
  const getSelectedEmployees = () => {
    return empPayrolls.filter(emp => selectedEmployees[emp.employeeId]);
  };
  
 // Replace the existing approveSelectedPayroll function with this:
 
const approveSelectedPayroll = async () => {
  try {
    setIsLoading(true);
    setShowApprovalDialog(false);
    
    const selectedPayrolls = getSelectedEmployees();
    const employeeIds = selectedPayrolls.map(p => p.employeeId);
    const amounts = selectedPayrolls.map(p => p.payrollBreakdown.netPayable);


    const response = await axios.put(
      `/api/payroll/payroll-process/${formData.payroll_id}`,
      {
        employeeIds,
        amounts,
        totalEmployees: empPayrolls.length
      }
    );

    // Create payslips only for newly approved employees
    const approvePromises = selectedPayrolls.map((payroll) =>
      axios.post("/api/payroll/payslip", {
        ...payroll,
        payrollId: formData.payroll_id,
        employerId,
      })
    );

    await Promise.all(approvePromises);
    
    setStatus({
      type: "success",
      message: `Approved ${selectedPayrolls.length} employees. ${empPayrolls.length - selectedPayrolls.length} remaining.`
    });

    if (response.data.success) {
      setStatus({
        type: "success",
        message: response.data.message
      });
      fetchPayrolls();
      calculatePayroll();}
    
 
  } catch (error) {
    setStatus({
      type: "error",
      message: "Failed to approve payroll: " + (error.response?.data?.message || error.message)
    });
  } finally {
    setIsLoading(false);
  }
};
  // Add this right before your return statement in the component
// This will track employees with issues when the payroll is calculated
useEffect(() => {
  if (empPayrolls.length > 0) {
    const issueEmployees = empPayrolls
      .filter(payroll => {
        const hasValidHours = payroll.workDetails.totalWorkHours > 0;
        const hasValidPay = payroll.payrollBreakdown.netPayable > 0;
        return !(hasValidHours && hasValidPay);
      })
      .map(payroll => payroll.employeeId);
    
    setEmployeesWithIssues(issueEmployees);
  }
}, [empPayrolls]);

// Add this function near your other action functions
const reopenPayrollPeriod = async () => {
  if (!confirm("Reopening will allow modifications to approved payrolls. Continue?")) return;
  
  try {
    await axios.put(`/api/payroll/payroll-process/${formData.payroll_id}`, {
      status: "Pending",
      processedEmployees: []
    });
    fetchPayrolls();
    calculatePayroll();
    setStatus({ type: "success", message: "Payroll reopened for modifications" });
  } catch (error) {
    setStatus({ type: "error", message: "Failed to reopen payroll" });
  }
};

// Add the button in the action section (near the export button):
{selectedPayroll?.status !== "Pending" && (
  <Button
    variant="outline"
    className="border-red-200 text-red-600 hover:bg-red-50"
    onClick={reopenPayrollPeriod}
  >
    <LockOpen className="mr-2 h-4 w-4" />
    Reopen Payroll
  </Button>
)}

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
                  <div className="rounded-md border overflow-hidden">
  <ScrollArea className="h-[60vh]">
    <Table>
      <TableHeader className="sticky top-0 bg-background z-10">
        <TableRow className="bg-muted/50">
          <TableHead className="w-12">
            <Checkbox 
              checked={empPayrolls.length > 0 && 
                empPayrolls.every(p => selectedEmployees[p.employeeId])}
              onCheckedChange={(checked) => {
                const newSelection = {};
                empPayrolls.forEach(p => {
                  newSelection[p.employeeId] = !!checked;
                });
                setSelectedEmployees(newSelection);
              }}
            />
          </TableHead>
          <TableHead className="font-bold">Employee</TableHead>
          <TableHead className="font-bold text-right">
            <div className="flex items-center justify-end">
              Work Hours
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-48">Total working hours recorded for this pay period</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </TableHead>
          <TableHead className="font-bold text-right">Overtime</TableHead>
          <TableHead className="font-bold text-right">Base Pay</TableHead>
          <TableHead className="font-bold text-right">Allowances</TableHead>
          <TableHead className="font-bold text-right">Deductions</TableHead>
          <TableHead className="font-bold text-right">Net Pay</TableHead>
          <TableHead className="font-bold">Approval Status</TableHead>
          </TableRow>
      </TableHeader>
      <TableBody>
        {empPayrolls.length > 0 ? (
          empPayrolls.map((payroll, index) => {
            // Calculate total deductions
            const totalDeductions = payroll.payrollBreakdown.deductions.paye +
              payroll.payrollBreakdown.deductions.npf +
              payroll.payrollBreakdown.deductions.acc +
              payroll.payrollBreakdown.deductions.other;
              
            // Check if data looks valid
            const hasValidHours = payroll.workDetails.totalWorkHours > 0;
            const hasValidPay = payroll.payrollBreakdown.netPayable > 0;
            const isDataComplete = hasValidHours && hasValidPay;
              
            return (
              <TableRow 
                key={index}
                className={!selectedEmployees[payroll.employeeId] ? "opacity-60 bg-muted/20" : ""}
              >
                <TableCell>
                  <Checkbox 
                    checked={!!selectedEmployees[payroll.employeeId]}
                    onCheckedChange={() => handleEmployeeSelection(payroll.employeeId)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    {payroll.employeeName}
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {payroll.employeeEmail}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {payroll.workDetails.totalWorkHours.toFixed(1)}h
                  {!hasValidHours && (
                    <Badge variant="outline" className="ml-2 text-amber-500 border-amber-200 bg-amber-50">
                      Low
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {(+payroll.workDetails.overtimeHours).toFixed(1)}h
                </TableCell>
                <TableCell className="text-right">
                  ${(+payroll.payrollBreakdown.baseSalary).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  ${(+payroll.payrollBreakdown.allowances).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="underline underline-offset-4 decoration-dotted">
                        ${totalDeductions.toFixed(2)}
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <div className="space-y-1 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <span>PAYE:</span>
                            <span className="text-right">${(+payroll.payrollBreakdown.deductions.paye).toFixed(2)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <span>NPF:</span>
                            <span className="text-right">${(+payroll.payrollBreakdown.deductions.npf).toFixed(2)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <span>ACC:</span>
                            <span className="text-right">${(+payroll.payrollBreakdown.deductions.acc).toFixed(2)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <span>Other:</span>
                            <span className="text-right">${(+payroll.payrollBreakdown.deductions.other).toFixed(2)}</span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="font-bold text-right">
                  ${(+payroll.payrollBreakdown.netPayable).toFixed(2)}
                  {!hasValidPay && (
                    <Badge variant="outline" className="ml-2 text-red-500 border-red-200 bg-red-50">
                      Issue
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
    {selectedPayroll?.processedEmployees?.includes(payroll.employeeId) ? (
      <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Approved
      </Badge>
    ) : (
      <Badge variant="outline" className="border-amber-200 text-amber-600 bg-amber-50">
        Pending
      </Badge>
    )}
  </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
              <div className="flex flex-col items-center justify-center space-y-3">
                <FileSpreadsheet className="h-8 w-8" />
                <p>No payroll data available</p>
                <p className="text-xs max-w-md">
                  Select a payroll period and click &quot;Calculate Payroll&quot; to process employee data
                </p>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </ScrollArea>
</div>

{empPayrolls.length > 0 && (
  <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
    <div className="text-sm text-muted-foreground">
      {Object.values(selectedEmployees).filter(Boolean).length} of {empPayrolls.length} employees selected
    </div>
    <div className="flex flex-wrap justify-end gap-4">
      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Export to Excel
      </Button>

       {/* Add this recalculation button */}
       {employeesWithIssues.some(id => !selectedEmployees[id]) && (
        <Button 
          variant="outline" 
          className="border-amber-500 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          onClick={recalculateSelectedPayroll}
          disabled={isLoading}
        >
          <Loader2 className={`mr-2 h-4 w-4  ${isLoading ? 'animate-spin' : ''}`} />
          Recalculate Fixed Employees
        </Button>
      )}


      <Button 
        onClick={() => setShowApprovalDialog(true)} 
        disabled={isLoading || Object.values(selectedEmployees).filter(Boolean).length === 0}
        className="bg-green-600 hover:bg-green-700"
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Approve Selected
      </Button>
    </div>
  </div>
)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
  <Card>
    <CardHeader>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <CardTitle>Payroll History</CardTitle>
          <CardDescription>View and manage past payroll records</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search payrolls..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
          <Select
            value={selectedStatus}
            onValueChange={(value) => {
              setSelectedStatus(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partially approved">Partially Approved</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Items/page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold cursor-pointer hover:bg-muted/50">
                <div className="flex items-center gap-1">
                  Period
                  <button onClick={() => handleSort('period')}>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </div>
              </TableHead>
              <TableHead className="font-bold">Type</TableHead>
              <TableHead className="font-bold cursor-pointer hover:bg-muted/50">
                <div className="flex items-center gap-1">
                  Date Range
                  <button onClick={() => handleSort('date')}>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </div>
              </TableHead>
              <TableHead className="font-bold text-right">Employees</TableHead>
              <TableHead className="font-bold text-right">Total Amount</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(itemsPerPage)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Search className="h-4 w-24" /></TableCell>
                  <TableCell><Search className="h-4 w-16" /></TableCell>
                  <TableCell><Search className="h-4 w-32" /></TableCell>
                  <TableCell><Search className="h-4 w-16" /></TableCell>
                  <TableCell><Search className="h-4 w-24" /></TableCell>
                  <TableCell><Search className="h-4 w-24" /></TableCell>
                  <TableCell><Search className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : currentItems.length > 0 ? (
              currentItems.map((payroll, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {payroll.month_no 
                      ? `${payroll.month_no}/${payroll.year}` 
                      : `Week ${payroll.week_no}, ${payroll.year}`}
                  </TableCell>
                  <TableCell>
                    {payroll.month_no ? "Monthly" : "Weekly"}
                  </TableCell>
                  <TableCell>
                    {new Date(payroll.date_from).toLocaleDateString()} - {new Date(payroll.date_to).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {payroll.processedEmployees.length || 0}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${payroll.totalAmount?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={payroll.status === "Approved" ? "default" : "outline"}
                      className={
                        payroll.status === "Pending" 
                          ? "bg-amber-50 text-amber-600 border-amber-200" 
                          : payroll.status === "Approved" 
                            ? "" 
                            : "bg-muted text-muted-foreground"
                      }
                    >
                      {payroll.status || "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            payroll_id: payroll.payroll_id,
                          }));
                          setSelectedPayroll(payroll);
                          document.querySelector('[value="generate"]')?.click();
                          if (payroll.status === "Approved") calculatePayroll();
                        }}
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                      </Button>
                      {payroll.status !== "Approved" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={async () => {
                            if (confirm(`Delete payroll period ${new Date(payroll.date_from).toLocaleDateString()} - ${new Date(payroll.date_to).toLocaleDateString()}?`)) {
                              try {
                                await axios.delete(`/api/payroll/payroll-process/${payroll.payroll_id}`);
                                fetchPayrolls();
                                setStatus({ type: "success", message: "Payroll period deleted" });
                              } catch (error) {
                                setStatus({ type: "error", message: "Delete failed" });
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <FileSpreadsheet className="h-8 w-8" />
                    <p>No matching payrolls found</p>
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedStatus("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredPayrolls.length > itemsPerPage && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPayrolls.length)} of {filteredPayrolls.length} payrolls
          </div>
          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(Math.max(1, currentPage - 1));
                  }}
                  className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(Math.min(totalPages, currentPage + 1));
                  }}
                  className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
  <AlertDialogContent className="max-w-2xl">
    <AlertDialogHeader>
      <AlertDialogTitle>Confirm Payroll Approval</AlertDialogTitle>
      <AlertDialogDescription>
        You are about to approve payroll for the following {getSelectedEmployees().length} employees:
      </AlertDialogDescription>
    </AlertDialogHeader>

    <div className="my-4 max-h-[40vh] overflow-auto border rounded-md">
      <Table>
        <TableHeader className="sticky top-0 bg-background">
          <TableRow className="bg-muted/50">
            <TableHead>Employee</TableHead>
            <TableHead className="text-right">Hours</TableHead>
            <TableHead className="text-right">Net Pay</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getSelectedEmployees().map((emp, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{emp.employeeName}</TableCell>
              <TableCell className="text-right">{emp.workDetails.totalWorkHours.toFixed(1)}h</TableCell>
              <TableCell className="text-right font-bold">
                ${emp.payrollBreakdown.netPayable.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableRow className="bg-muted/20 font-bold">
          <TableCell>Total</TableCell>
          <TableCell className="text-right">
            {getSelectedEmployees().reduce((sum, emp) => sum + emp.workDetails.totalWorkHours, 0).toFixed(1)}h
          </TableCell>
          <TableCell className="text-right">
            ${getSelectedEmployees().reduce((sum, emp) => sum + emp.payrollBreakdown.netPayable, 0).toFixed(2)}
          </TableCell>
        </TableRow>
      </Table>
    </div>

    <AlertDialogDescription className="text-amber-600">
    {selectedPayroll?.status === "Approved" && (
    <p className="mb-2 font-medium">
      ⚠️ This payroll was previously approved on{" "}
      {new Date(selectedPayroll.updatedAt).toLocaleDateString()}
    </p>
  )}
  This action will generate payslips for {getSelectedEmployees().length} employees.
  {empPayrolls.length - getSelectedEmployees().length > 0 && (
    <p className="mt-2">
      {empPayrolls.length - getSelectedEmployees().length} employees will remain pending.
    </p>
  )}
    </AlertDialogDescription>

    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={approveSelectedPayroll}
        className="bg-green-600 hover:bg-green-700"
      >
        Approve Payroll
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </div>
  );
};
export default PayrollDashboard;
