"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {Input} from "@/components/ui/input";
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
import Header from "@/components/breadcumb";

const ModernPayrollDashboard = () => {
  const { data: session } = useSession();
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
      const key = `${employeeId}-${periodType === "monthly" ? monthNo : weekNo}`;
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
            deductions: { paye: 0, npf: 0, acc: 0, total: 0 },
            employerContributions: { npf: 0, acc: 0 },
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
      entry.payrollBreakdown.employerContributions.npf += breakdown.employerContributions.npf;
      entry.payrollBreakdown.employerContributions.acc += breakdown.employerContributions.acc;
      entry.payrollBreakdown.netPayable += breakdown.netPayable;
    });
    if (periodType === "fortnightly") {
      const fortnightlyGrouped = {};
      Object.values(grouped).forEach((entry) => {
        const fortnightNo = Math.ceil(entry.weekNo / 2);
        const key = `${entry.employeeId}-${fortnightNo}`;
        if (!fortnightlyGrouped[key]) fortnightlyGrouped[key] = { ...entry };
        else {
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
        const response = await fetch(`/api/payroll/payslip?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
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
    totalPayroll: payslips.reduce((sum, p) => sum + p.payrollBreakdown.netPayable, 0),
    totalPAYE: payslips.reduce((sum, p) => sum + p.payrollBreakdown.deductions.paye, 0),
    totalNPF: payslips.reduce((sum, p) => sum + p.payrollBreakdown.deductions.npf, 0),
    totalACC: payslips.reduce((sum, p) => sum + p.payrollBreakdown.deductions.acc, 0),
  });

  const stats = calculateStats();

  const getTableContent = () => {
    const filtered = payslips.filter((p) => p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const payrollTotal = filtered.reduce((acc, p) => ({
      salary: acc.salary + p.payrollBreakdown.baseSalary,
      allowances: acc.allowances + p.payrollBreakdown.allowances,
      deductions: acc.deductions + p.payrollBreakdown.deductions.total,
      total: acc.total + (p.payrollBreakdown.baseSalary + p.payrollBreakdown.allowances - p.payrollBreakdown.deductions.total)
    }), {salary: 0, allowances: 0, deductions: 0, total: 0});

    const payeTotal = filtered.reduce((acc, p) => ({
      salary: acc.salary + p.payrollBreakdown.baseSalary,
      paye: acc.paye + p.payrollBreakdown.deductions.paye
    }), {salary: 0, paye: 0});

    const npfTotal = filtered.reduce((acc, p) => ({
      empContribution: acc.empContribution + p.payrollBreakdown.deductions.npf,
      employerContribution: acc.employerContribution + p.payrollBreakdown.employerContributions.npf,
      total: acc.total + (p.payrollBreakdown.deductions.npf + p.payrollBreakdown.employerContributions.npf)
    }), {empContribution: 0, employerContribution: 0, total: 0});

    const accTotal = filtered.reduce((acc, p) => ({
      empContribution: acc.empContribution + p.payrollBreakdown.deductions.acc,
      employerContribution: acc.employerContribution + p.payrollBreakdown.employerContributions.acc,
      total: acc.total + (p.payrollBreakdown.deductions.acc + p.payrollBreakdown.employerContributions.acc)
    }), {empContribution: 0, employerContribution: 0, total: 0});

    const configs = {
      payroll: {
        headers: ["Employee", "Period", "Salary", "Overtime", "Allowances", "Deductions", "Total"],
        rows: [
          ...filtered.map((p) => [
            p.employeeName,
            periodType === "monthly" ? format(startDate, "MMMM yyyy") : periodType === "fortnightly" ? `Fortnight ${Math.ceil(p.weekNo / 2)}` : `Week ${p.weekNo}`,
            `$${p.payrollBreakdown.baseSalary.toFixed(2)}`,
            "$0.00",
            `$${p.payrollBreakdown.allowances.toFixed(2)}`,
            `$${p.payrollBreakdown.deductions.total.toFixed(2)}`,
            `$${(p.payrollBreakdown.baseSalary + p.payrollBreakdown.allowances - p.payrollBreakdown.deductions.total).toFixed(2)}`
          ]),
          ["Total", "", `$${payrollTotal.salary.toFixed(2)}`, "$0.00", `$${payrollTotal.allowances.toFixed(2)}`, `$${payrollTotal.deductions.toFixed(2)}`, `$${payrollTotal.total.toFixed(2)}`]
        ]
      },
      paye: {
        headers: ["Employee", "Period", "Salary", "PAYE Amount"],
        rows: [
          ...filtered.map((p) => [
            p.employeeName,
            periodType === "monthly" ? format(startDate, "MMMM yyyy") : periodType === "fortnightly" ? `Fortnight ${Math.ceil(p.weekNo / 2)}` : `Week ${p.weekNo}`,
            `$${p.payrollBreakdown.baseSalary.toFixed(2)}`,
            `$${p.payrollBreakdown.deductions.paye.toFixed(2)}`
          ]),
          ["Total", "", `$${payeTotal.salary.toFixed(2)}`, `$${payeTotal.paye.toFixed(2)}`]
        ]
      },
      npf: {
        headers: ["Employee", "NPF Number", "Period", "Salary", "Employee Contribution", "Employer Contribution", "Total"],
        rows: [
          ...filtered.map((p) => [
            p.employeeName,
            p.npfNumber || "N/A",
            periodType === "monthly" ? format(startDate, "MMMM yyyy") : periodType === "fortnightly" ? `Fortnight ${Math.ceil(p.weekNo / 2)}` : `Week ${p.weekNo}`,
            `$${p.payrollBreakdown.baseSalary.toFixed(2)}`,
            `$${p.payrollBreakdown.deductions.npf.toFixed(2)}`,
            `$${p.payrollBreakdown.employerContributions.npf.toFixed(2)}`,
            `$${(p.payrollBreakdown.deductions.npf + p.payrollBreakdown.employerContributions.npf).toFixed(2)}`
          ]),
          ["Total", "", "", "", `$${npfTotal.empContribution.toFixed(2)}`, `$${npfTotal.employerContribution.toFixed(2)}`, `$${npfTotal.total.toFixed(2)}`]
      ]},
      acc: {
        headers: ["Employee", "NPF Number", "Period", "Salary", "Employee Contribution", "Employer Contribution", "Total"],
        rows: [
          ...filtered.map((p) => [
            p.employeeName,
            p.npfNumber || "N/A",
            periodType === "monthly" ? format(startDate, "MMMM yyyy") : periodType === "fortnightly" ? `Fortnight ${Math.ceil(p.weekNo / 2)}` : `Week ${p.weekNo}`,
            `$${p.payrollBreakdown.baseSalary.toFixed(2)}`,
            `$${p.payrollBreakdown.deductions.acc.toFixed(2)}`,
            `$${p.payrollBreakdown.employerContributions.acc.toFixed(2)}`,
            `$${(p.payrollBreakdown.deductions.acc + p.payrollBreakdown.employerContributions.acc).toFixed(2)}`
          ]),
          ["Total", "", "", "", `$${accTotal.empContribution.toFixed(2)}`, `$${accTotal.employerContribution.toFixed(2)}`, `$${accTotal.total.toFixed(2)}`]
      ]}
    };
    return configs[reportType] || configs.payroll;
  };

  const getStatCardConfig = () => {
    const configs = {
      payroll: [
        { icon: Users, title: "Employees", value: stats.totalEmployees, color: "bg-blue-500" },
        { icon: DollarSign, title: "Payroll", value: stats.totalPayroll, color: "bg-green-500" },
        { icon: Building, title: "Deductions", value: payslips.reduce((sum, p) => sum + p.payrollBreakdown.deductions.total, 0), color: "bg-purple-500" },
        { icon: PieChart, title: "Avg Salary", value: stats.totalPayroll / stats.totalEmployees, color: "bg-orange-500" },
      ],
      paye: [
        { icon: Users, title: "Employees", value: stats.totalEmployees, color: "bg-blue-500" },
        { icon: DollarSign, title: "PAYE", value: stats.totalPAYE, color: "bg-green-500" },
        // { icon: Building, title: "Employer PAYE", value: payslips.reduce((sum, p) => sum + p.payrollBreakdown.employerContributions.paye, 0), color: "bg-purple-500" },
        // { icon: DollarSign, title: "Total Tax", value: stats.totalPAYE + payslips.reduce((sum, p) => sum + p.payrollBreakdown.employerContributions.paye, 0), color: "bg-orange-500" },
      ],
      npf: [
        { icon: Users, title: "Employees", value: stats.totalEmployees, color: "bg-blue-500" },
        { icon: DollarSign, title: "Employee NPF", value: stats.totalNPF, color: "bg-green-500" },
        { icon: Building, title: "Employer NPF", value: payslips.reduce((sum, p) => sum + p.payrollBreakdown.employerContributions.npf, 0), color: "bg-purple-500" },
        { icon: DollarSign, title: "Total NPF", value: stats.totalNPF + payslips.reduce((sum, p) => sum + p.payrollBreakdown.employerContributions.npf, 0), color: "bg-orange-500" },
      ],
      acc: [
        { icon: Users, title: "Employees", value: stats.totalEmployees, color: "bg-blue-500" },
        { icon: DollarSign, title: "Employee ACC", value: stats.totalACC, color: "bg-green-500" },
        { icon: Building, title: "Employer ACC", value: payslips.reduce((sum, p) => sum + p.payrollBreakdown.employerContributions.acc, 0), color: "bg-purple-500" },
        { icon: DollarSign, title: "Total ACC", value: stats.totalACC + payslips.reduce((sum, p) => sum + p.payrollBreakdown.employerContributions.acc, 0), color: "bg-orange-500" },
      ],
    };
    return configs[reportType] || configs.payroll;
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`/api/export/${reportType}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&format=${format}&employerId=${employerId}&periodType=${periodType}`, { responseType: 'blob' });
      if (!response.data) throw new Error("Export failed");
      const blob = new Blob([response.data], { type: format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf' });
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
    <div className="min-h-screen bg-background">
      <Header heading="Payroll Reports" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-foreground border-white/10 shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-background tracking-tight">
                  Payroll Reports
                </h1>
                <p className="text-background/70">
                  Manage and track all payroll reports in one place
                </p>
              </div>
              
              <div className="flex flex-col xs:flex-row gap-4">
                <Select value={periodType} onValueChange={setPeriodType}>
                  <SelectTrigger className="bg-background/5 border-background/10 text-background w-[180px]">
                    <SelectValue />
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
                        className="bg-background/5 border-background/10 text-background hover:bg-background/10"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, "dd/MM/yyyy")}
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
                        className="bg-background/5 border-background/10 text-background hover:bg-background/10"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(endDate, "dd/MM/yyyy")}
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
                    className="bg-background/5 border-background/10 text-background hover:bg-background/10"
                    onClick={() => handleExport("xlsx")}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-background/5 border-background/10 text-background hover:bg-background/10"
                    onClick={() => handleExport("pdf")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {getStatCardConfig().map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-background/5 border-background/10 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${card.color}`}>
                          <card.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-background/60">{card.title}</p>
                          <h3 className="text-lg font-semibold text-background">
                            {typeof card.value === "number" ? `$${card.value.toFixed(2)}` : card.value}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-4 h-4" />
                <Input
                  placeholder="Search employee..."
                  className="pl-10 bg-background/5 border-background/10 text-background placeholder:text-background/40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
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
                  className="flex items-center gap-2 bg-background/5 border-background/10 text-background hover:bg-background/10 focus:bg-background focus:text-foreground "
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  className="flex justify-center items-center h-64"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-background"></div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-background/5">
                          {getTableContent().headers.map((header, index) => (
                            <TableHead
                              key={index}
                              className="text-background font-medium py-3 px-4"
                            >
                              {header}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getTableContent().rows.map((row, rowIndex) => (
                          <TableRow
                            key={rowIndex}
                            className="border-background/10 hover:bg-background/5"
                          >
                            {row.map((cell, cellIndex) => (
                              <TableCell
                                key={cellIndex}
                                className={`text-background py-3 px-4 ${rowIndex === getTableContent().rows.length - 1 ? "font-bold bg-background/5" : ""}`}
                              >
                                {cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModernPayrollDashboard;