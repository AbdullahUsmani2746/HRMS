"use client"
import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  const [status, setStatus] = useState({ type: '', message: '' });
  const [payrollStats, setPayrollStats] = useState({
    totalEmployees: 0,
    totalPayroll: 0,
    averageSalary: 0
  });
  const [selectedPayroll, setSelectedPayroll] = useState(null);

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
      const response = await axios.get(`/api/payroll/payroll-process?employerId=${employerId}`);
      if (response.data.success) {
        setPayrolls(response.data.data);
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to fetch payroll periods'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePayroll = async () => {
    if (!formData.payroll_id) {
      setStatus({
        type: 'error',
        message: 'Please select a payroll period'
      });
      return;
    }

    try {
      setIsLoading(true);
      const empData = await axios.get(`/api/employees?employerId=${employerId}`);
   

      const selectedPayrollPeriod = payrolls.find(p => p.payroll_id === formData.payroll_id);
      

      // Process employee data and calculate payroll
      const processedPayroll = await processPayrollData(empData.data.data, selectedPayrollPeriod);

      setEmpPayrolls(processedPayroll);
      
      // Calculate statistics
      const stats = calculatePayrollStats(processedPayroll);
      setPayrollStats(stats);
      
      setStatus({
        type: 'success',
        message: 'Payroll calculated successfully'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Error calculating payroll'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processPayrollData = async (employees, payrollPeriod) => {
    const startDate = new Date(payrollPeriod.date_from);
    const endDate = new Date(payrollPeriod.date_to);

    return Promise.all(employees.map(async (employee) => {
      // ... existing payroll calculation logic ...
      // Enhanced with more detailed calculations
      const payrollDetails = calculateEmployeePayroll(employee, startDate, endDate);
      return payrollDetails;
    }));
  };

  const calculatePayrollStats = (payrollData) => {
    const totalEmployees = payrollData.length;
    const totalPayroll = payrollData.reduce((sum, emp) => sum + emp.netPayable, 0);
    const averageSalary = totalPayroll / totalEmployees;

    return {
      totalEmployees,
      totalPayroll,
      averageSalary
    };
  };

  const approvePayroll = async () => {
    try {
      setIsLoading(true);
      const approvePromises = empPayrolls.map(payroll =>
        axios.post("/api/payroll/payslip", {
          ...payroll,
          payrollId: formData.payroll_id,
          employerId,
        })
      );

      await Promise.all(approvePromises);
      setStatus({
        type: 'success',
        message: 'Payroll approved successfully'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to approve payroll'
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
              <p className="text-3xl font-bold">{payrollStats.totalEmployees}</p>
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
          <Alert className={`mb-6 ${status.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
            <AlertCircle className={status.type === 'error' ? 'text-red-600' : 'text-green-600'} />
            <AlertTitle>
              {status.type === 'error' ? 'Error' : 'Success'}
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
                <CardDescription>Select a payroll period to process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label htmlFor="payroll_id">Payroll Period</Label>
                      <Select
                        onValueChange={(value) => {
                          setFormData(prev => ({ ...prev, payroll_id: value }));
                          setSelectedPayroll(payrolls.find(p => p.payroll_id === value));
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
                              {`${new Date(payroll.date_from).toLocaleDateString()} - ${new Date(payroll.date_to).toLocaleDateString()}`}
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
                        'Calculate Payroll'
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
                          <TableHead>Base Salary</TableHead>
                          <TableHead>Allowances</TableHead>
                          <TableHead>Deductions</TableHead>
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
                              <TableCell>{payroll.totalWorkHours}</TableCell>
                              <TableCell>{payroll.overtimeHours}</TableCell>
                              <TableCell>${payroll.salary.toFixed(2)}</TableCell>
                              <TableCell>${payroll.allowances.toFixed(2)}</TableCell>
                              <TableCell>${payroll.deductions.toFixed(2)}</TableCell>
                              <TableCell className="font-bold">
                                ${payroll.netPayable.toFixed(2)}
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
                      <Button
                        onClick={approvePayroll}
                        disabled={isLoading}
                      >
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