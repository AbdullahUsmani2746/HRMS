"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  PieChart,
  Users,
  DollarSign,
  Building,
} from "lucide-react";
import { useSession } from "next-auth/react";

const ModernPayrollDashboard = () => {

  const {data:session} = useSession();
  const employerId = session?.user?.username;

  const [reportType, setReportType] = useState("payroll");
  const [periodType, setPeriodType] = useState("weekly");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  const aggregatePayslips = (payslips, periodType) => {
    const grouped = {};

    payslips.forEach((payslip) => {
      const weekNo = payslip.weekNo;
      const monthNo = payslip.monthNo;
      const employeeId = payslip.employeeId;
      const key = `${employeeId}-${
        periodType === "monthly" ? monthNo : weekNo
      }`;

      if (!grouped[key]) {
        grouped[key] = {
          employeeId: payslip.employeeId,
          employeeName: payslip.employeeName,
          employerId: payslip.employerId,
          weekNo: weekNo,
          monthNo: monthNo,
          payrollBreakdown: {
            baseSalary: 0,
            allowances: 0,
            deductions: {
              paye: 0,
              npf: 0,
              acc: 0,
              total: 0,
            },
            employerContributions: {
              npf: 0,
              acc: 0,
            },
            netPayable: 0,
          },
        };
      }

      const entry = grouped[key];
      const breakdown = payslip.payrollBreakdown;

      entry.payrollBreakdown.baseSalary += breakdown.baseSalary;
      entry.payrollBreakdown.allowances += breakdown.allowances;
      entry.payrollBreakdown.deductions.paye += breakdown.deductions.paye;
      entry.payrollBreakdown.deductions.npf += breakdown.deductions.npf;
      entry.payrollBreakdown.deductions.acc += breakdown.deductions.acc;
      entry.payrollBreakdown.deductions.total += breakdown.deductions.total;
      entry.payrollBreakdown.employerContributions.npf +=
        breakdown.employerContributions.npf;
      entry.payrollBreakdown.employerContributions.acc +=
        breakdown.employerContributions.acc;
      entry.payrollBreakdown.netPayable += breakdown.netPayable;
    });

    if (periodType === "fortnightly") {
      const fortnightlyGrouped = {};
      Object.values(grouped).forEach((entry) => {
        const fortnightNo = Math.ceil(entry.weekNo / 2);
        const key = `${entry.employeeId}-${fortnightNo}`;

        if (!fortnightlyGrouped[key]) {
          fortnightlyGrouped[key] = { ...entry };
        } else {
          const target = fortnightlyGrouped[key].payrollBreakdown;
          const source = entry.payrollBreakdown;

          target.baseSalary += source.baseSalary;
          target.allowances += source.allowances;
          target.deductions.paye += source.deductions.paye;
          target.deductions.npf += source.deductions.npf;
          target.deductions.acc += source.deductions.acc;
          target.deductions.total += source.deductions.total;
          target.employerContributions.npf += source.employerContributions.npf;
          target.employerContributions.acc += source.employerContributions.acc;
          target.netPayable += source.netPayable;
        }
      });
      return Object.values(fortnightlyGrouped);
    }

    return Object.values(grouped);
  };

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await fetch(
          `/api/payroll/payslip?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        const data = await response.json();
        const aggregatedData = aggregatePayslips(data, periodType);
        setPayslips(aggregatedData);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [startDate, endDate, periodType]);

  const calculateStats = () => ({
    totalEmployees: payslips.length,
    totalPayroll: payslips.reduce(
      (sum, p) => sum + p.payrollBreakdown.netPayable,
      0
    ),
    totalPAYE: payslips.reduce(
      (sum, p) => sum + p.payrollBreakdown.deductions.paye,
      0
    ),
    totalNPF: payslips.reduce(
      (sum, p) => sum + p.payrollBreakdown.deductions.npf,
      0
    ),
    totalACC: payslips.reduce(
      (sum, p) => sum + p.payrollBreakdown.deductions.acc,
      0
    ),
    departments: new Set(payslips.map((p) => p.department)),
  });

  const stats = calculateStats();

  const getTableContent = () => {
    const filtered = payslips.filter((p) =>
      p.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const periodLabel =
      periodType === "monthly"
        ? "Month"
        : periodType === "fortnightly"
        ? "Fortnight"
        : "Week";

    const configs = {
      payroll: {
        headers: [
          "NPF Number",
          "Employee",
          periodLabel,
          "Basic Salary",
          "Allowances",
          "Total Deductions",
          "Net Salary",
        ],
        rows: filtered.map((p) => [
          p.employeeId,
          p.employeeName,
          periodType === "monthly"
            ? p.monthNo
            : periodType === "fortnightly"
            ? Math.ceil(p.weekNo / 2)
            : p.weekNo,
          `$${p.payrollBreakdown.baseSalary.toFixed(2)}`,
          `$${p.payrollBreakdown.allowances.toFixed(2)}`,
          `$${p.payrollBreakdown.deductions.total.toFixed(2)}`,
          `$${p.payrollBreakdown.netPayable.toFixed(2)}`,
        ]),
      },
      paye: {
        headers: [
          "NPF Number",
          "Employee",
          "Client ID",
          periodLabel,
          "Taxable Income",
          "PAYE Amount",
        ],
        rows: filtered.map((p) => [
          p.employeeId,
          p.employeeName,
          p.employerId,
          periodType === "monthly"
            ? p.monthNo
            : periodType === "fortnightly"
            ? Math.ceil(p.weekNo / 2)
            : p.weekNo,
          `$${(
            p.payrollBreakdown.baseSalary + p.payrollBreakdown.allowances
          ).toFixed(2)}`,
          `$${p.payrollBreakdown.deductions.paye.toFixed(2)}`,
        ]),
      },
      npf: {
        headers: [
          "NPF Number",
          "Employee",
          "Client ID",
          periodLabel,
          "Gross Salary",
          "Employee Contribution",
          "Employer Contribution",
        ],
        rows: filtered.map((p) => [
          p.employeeId,
          p.employeeName,
          p.employerId,
          periodType === "monthly"
            ? p.monthNo
            : periodType === "fortnightly"
            ? Math.ceil(p.weekNo / 2)
            : p.weekNo,
          `$${p.payrollBreakdown.baseSalary.toFixed(2)}`,
          `$${p.payrollBreakdown.deductions.npf.toFixed(2)}`,
          `$${p.payrollBreakdown.employerContributions.npf.toFixed(2)}`,
        ]),
      },
      acc: {
        headers: [
          "NPF Number",
          "Employee",
          "Client ID",
          periodLabel,
          "Gross Salary",
          "Employee Contribution",
          "Employer Contribution",
        ],
        rows: filtered.map((p) => [
          p.employeeId,
          p.employeeName,
          p.employerId,
          periodType === "monthly"
            ? p.monthNo
            : periodType === "fortnightly"
            ? Math.ceil(p.weekNo / 2)
            : p.weekNo,
          `$${(
            p.payrollBreakdown.baseSalary + p.payrollBreakdown.allowances
          ).toFixed(2)}`,
          `$${p.payrollBreakdown.deductions.acc.toFixed(2)}`,
          `$${p.payrollBreakdown.employerContributions.acc.toFixed(2)}`,
        ]),
      },
    };

    return configs[reportType] || configs.payroll;
  };

  const getStatCardConfig = () => {
    const configs = {
      payroll: [
        {
          icon: Users,
          title: "Total Employees",
          value: stats.totalEmployees,
          color: "bg-blue-500",
        },
        {
          icon: DollarSign,
          title: "Total Payroll",
          value: stats.totalPayroll,
          color: "bg-green-500",
        },
        {
          icon: Building,
          title: "Total Deductions",
          value: payslips.reduce(
            (sum, p) => sum + p.payrollBreakdown.deductions.total,
            0
          ),
          color: "bg-purple-500",
        },
        {
          icon: PieChart,
          title: "Average Salary",
          value: stats.totalPayroll / stats.totalEmployees,
          color: "bg-orange-500",
        },
      ],
      paye: [
        {
          icon: Users,
          title: "Total Employees",
          value: stats.totalEmployees,
          color: "bg-blue-500",
        },
        {
          icon: DollarSign,
          title: "Total PAYE",
          value: stats.totalPAYE,
          color: "bg-green-500",
        },
        {
          icon: Building,
          title: "Average PAYE",
          value: stats.totalPAYE / stats.totalEmployees,
          color: "bg-purple-500",
        },
        {
          icon: PieChart,
          title: "PAYE Ratio",
          value: (stats.totalPAYE / stats.totalPayroll) * 100,
          color: "bg-orange-500",
        },
      ],
      npf: [
        {
          icon: Users,
          title: "Total Employees",
          value: stats.totalEmployees,
          color: "bg-blue-500",
        },
        {
          icon: DollarSign,
          title: "Total NPF",
          value: stats.totalNPF,
          color: "bg-green-500",
        },
        {
          icon: Building,
          title: "Employer NPF",
          value: payslips.reduce(
            (sum, p) => sum + p.payrollBreakdown.employerContributions.npf,
            0
          ),
          color: "bg-purple-500",
        },
        {
          icon: PieChart,
          title: "NPF Ratio",
          value: (stats.totalNPF / stats.totalPayroll) * 100,
          color: "bg-orange-500",
        },
      ],
      acc: [
        {
          icon: Users,
          title: "Total Employees",
          value: stats.totalEmployees,
          color: "bg-blue-500",
        },
        {
          icon: DollarSign,
          title: "Total ACC",
          value: stats.totalACC,
          color: "bg-green-500",
        },
        {
          icon: Building,
          title: "Employer ACC",
          value: payslips.reduce(
            (sum, p) => sum + p.payrollBreakdown.employerContributions.acc,
            0
          ),
          color: "bg-purple-500",
        },
        {
          icon: PieChart,
          title: "ACC Ratio",
          value: (stats.totalACC / stats.totalPayroll) * 100,
          color: "bg-orange-500",
        },
      ],
    };

    return configs[reportType] || configs.payroll;
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(
        `/api/export/${reportType}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&format=${format}&employerId=${employerId}&periodType=${periodType}`,
        {
          responseType: 'blob' // Important for handling file downloads
        }
      );
  
      // Check if response exists and has data
      if (!response.data) throw new Error("Export failed");
  
      // Create blob URL directly from response data
      const blob = new Blob([response.data], {
        type: format === 'xlsx' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}-report.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error(`Export error:`, error);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {getStatCardConfig().map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      <Card className="bg-white">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-bold">
              {reportType.toUpperCase()} Report
            </CardTitle>

            <div className="flex flex-wrap gap-4">
              <Select value={periodType} onValueChange={setPeriodType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="fortnightly">Fortnightly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[200px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[200px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(endDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => handleExport("xlsx")}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => handleExport("pdf")}
                >
                  <FileText className="w-4 h-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by employee name..."
                className="w-full pl-10 pr-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { type: "payroll", icon: DollarSign, label: "Payroll" },
              { type: "paye", icon: Building, label: "PAYE" },
              { type: "npf", icon: Users, label: "NPF" },
              { type: "acc", icon: PieChart, label: "ACC" },
            ].map(({ type, icon: Icon, label }) => (
              <Button
                key={type}
                variant={reportType === type ? "default" : "outline"}
                onClick={() => setReportType(type)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                className="flex justify-center items-center h-48"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      {getTableContent().headers.map((header, index) => (
                        <TableHead key={index}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getTableContent().rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, color }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="bg-white hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold">
              {typeof value === "number" ? value.toFixed(2) : value}
            </h3>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default ModernPayrollDashboard;
