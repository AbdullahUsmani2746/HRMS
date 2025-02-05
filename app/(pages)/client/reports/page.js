"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  FileText,
  Filter, 
  Search,
  PieChart,
  Users,
  DollarSign,
  Building
} from 'lucide-react';

const ModernPayrollDashboard = () => {
  const [reportType, setReportType] = useState('payroll');
  const [month, setMonth] = useState('January');
  const [year, setYear] = useState('2025');
  const [searchTerm, setSearchTerm] = useState('');
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch payslips for the selected month and year
    const fetchPayslips = async () => {
      try {
        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        
        const response = await fetch(`/api/payroll/payslip?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
        const data = await response.json();
        setPayslips(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching payslips:', error);
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [month, year]);

  // Calculate summary statistics
  const calculateStats = () => {
    return payslips.reduce((acc, payslip) => ({
      totalEmployees: acc.totalEmployees + 1,
      totalPayroll: acc.totalPayroll + payslip.payrollBreakdown.netPayable,
      totalPAYE: acc.totalPAYE + payslip.payrollBreakdown.deductions.paye,
      totalNPF: acc.totalNPF + payslip.payrollBreakdown.deductions.npf,
      totalACC: acc.totalACC + payslip.payrollBreakdown.deductions.acc,
      departments: new Set([...acc.departments, payslip.department])
    }), {
      totalEmployees: 0,
      totalPayroll: 0,
      totalPAYE: 0,
      totalNPF: 0,
      totalACC: 0,
      departments: new Set()
    });
  };

  const stats = calculateStats();

  const getTableContent = () => {
    const filteredPayslips = payslips.filter(payslip => 
      payslip.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tableConfigs = {
      payroll: {
        headers: ['NPF Number', 'Employee', 'Basic Salary', 'Allowances', 'Total Deductions', 'Net Salary'],
        rows: filteredPayslips.map(payslip => [
          payslip.employeeId,
          payslip.employeeName,
          `$${payslip.payrollBreakdown.baseSalary.toFixed(2)}`,
          `$${payslip.payrollBreakdown.allowances.toFixed(2)}`,
          `$${payslip.payrollBreakdown.deductions.total.toFixed(2)}`,
          `$${payslip.payrollBreakdown.netPayable.toFixed(2)}`
        ])
      },
      paye: {
        headers: ['NPF Number', 'Employee', 'Taxable Income', 'PAYE Amount'],
        rows: filteredPayslips.map(payslip => [
          payslip.employeeId,
          payslip.employeeName,
          `$${(payslip.payrollBreakdown.baseSalary + payslip.payrollBreakdown.allowances).toFixed(2)}`,
          `$${payslip.payrollBreakdown.deductions.paye.toFixed(2)}`
        ])
      },
      npf: {
        headers: ['NPF Number', 'Employee', 'Gross Salary', 'Employee Contribution', 'Employer Contribution'],
        rows: filteredPayslips.map(payslip => [
          payslip.employeeId,
          payslip.employeeName,
          `$${payslip.payrollBreakdown.baseSalary.toFixed(2)}`,
          `$${payslip.payrollBreakdown.deductions.npf.toFixed(2)}`,
          `$${payslip.payrollBreakdown.employerContributions.npf.toFixed(2)}`
        ])
      },
      acc: {
        headers: ['NPF Number', 'Employee', 'Earnings', 'ACC Levy'],
        rows: filteredPayslips.map(payslip => [
          payslip.employeeId,
          payslip.employeeName,
          `$${(payslip.payrollBreakdown.baseSalary + payslip.payrollBreakdown.allowances).toFixed(2)}`,
          `$${payslip.payrollBreakdown.deductions.acc.toFixed(2)}`
        ])
      }
    };

    return tableConfigs[reportType] || tableConfigs.payroll;
  };

  const handleExport = async (format, type) => {
    try {
      const response = await fetch(`/api/export/${reportType}?month=${month}&year=${year}&format=${format}&type=${type}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }
      
      if (response.headers.get('Content-Type').includes('spreadsheetml.sheet')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${month}-${year}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
      // Add user notification here if needed
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{title}</p>
              <h3 className="text-2xl font-bold">{typeof value === 'number' ? value.toFixed(2) : value}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          icon={Users} 
          title="Total Employees" 
          value={stats.totalEmployees} 
          color="bg-blue-500"
        />
        <StatCard 
          icon={DollarSign} 
          title="Total Payroll" 
          value={stats.totalPayroll} 
          color="bg-green-500"
        />
        <StatCard 
          icon={Building} 
          title="Total PAYE" 
          value={stats.totalPAYE} 
          color="bg-purple-500"
        />
        <StatCard 
          icon={PieChart} 
          title={`Total ${reportType.toUpperCase()}`} 
          value={stats[`total${reportType.toUpperCase()}`] || 0} 
          color="bg-orange-500"
        />
      </div>

      <Card className="bg-white">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-bold">
              {reportType.toUpperCase()} Report
            </CardTitle>
            
            <div className="flex flex-wrap gap-4">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-32">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {['2024', '2025'].map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleExport('xlsx' , 'acc')}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleExport('pdf')}
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </Button>
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
            <Button
              variant={reportType === 'payroll' ? 'default' : 'outline'}
              onClick={() => setReportType('payroll')}
              className="flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Payroll
            </Button>
            <Button
              variant={reportType === 'paye' ? 'default' : 'outline'}
              onClick={() => setReportType('paye')}
              className="flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              PAYE
            </Button>
            <Button
              variant={reportType === 'npf' ? 'default' : 'outline'}
              onClick={() => setReportType('npf')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              NPF
            </Button>
            <Button
              variant={reportType === 'acc' ? 'default' : 'outline'}
              onClick={() => setReportType('acc')}
              className="flex items-center gap-2"
            >
              <PieChart className="w-4 h-4" />
              ACC
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
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
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernPayrollDashboard;