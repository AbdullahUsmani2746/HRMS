"use client"
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "axios";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/breadcumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Trash2, Calendar, Plus } from "lucide-react";

export default function PayrollProcessPage() {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "CLIENT-001";
  const [payrolls, setPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [stats, setStats] = useState({
    totalPayrolls: 0,
    currentMonth: 0,
    pendingPayrolls: 0,
  });

  useEffect(() => {
    fetchPayrollProcesses();
  }, []);

  useEffect(() => {
    if (payrolls.length > 0) {
      calculateStats();
    }
  }, [payrolls]);

  const calculateStats = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    
    setStats({
      totalPayrolls: payrolls.length,
      currentMonth: payrolls.filter(p => p.month_no === currentMonth).length,
      pendingPayrolls: payrolls.filter(p => !p.isProcessed).length,
    });
  };

  const fetchPayrollProcesses = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/api/payroll/payroll-process?employerId=" + employerId);
      setPayrolls(data.data || []);
      setStatus({ type: "success", message: "Payroll periods loaded successfully" });
    } catch (error) {
      setStatus({ type: "error", message: "Failed to fetch payroll periods" });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePayrollPeriod = async (payrollId) => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/payroll/payroll-process/${payrollId}`);
      setStatus({ type: "success", message: "Payroll period deleted successfully" });
      fetchPayrollProcesses();
    } catch (error) {
      setStatus({ type: "error", message: "Failed to delete payroll period" });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePayroll = async () => {
    if (!dateFrom || !dateTo) {
      setStatus({ type: "error", message: "Please provide both 'Date From' and 'Date To'" });
      return;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      setStatus({ type: "error", message: "'Date From' cannot be later than 'Date To'" });
      return;
    }

    if (isDateRangeOverlapping(dateFrom, dateTo)) {
      setStatus({ type: "error", message: "The provided date range overlaps with an existing payroll" });
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post("/api/payroll/payroll-process", {
        date_from: dateFrom,
        date_to: dateTo,
        employerId,
      });
      
      if (data.success) {
        setStatus({ type: "success", message: "Payroll process generated successfully!" });
        fetchPayrollProcesses();
        setDateFrom("");
        setDateTo("");
      }
    } catch (error) {
      setStatus({ type: "error", message: "Failed to generate payroll process" });
    } finally {
      setIsLoading(false);
    }
  };

  const isDateRangeOverlapping = (newStart, newEnd) => {
    const newStartDate = new Date(newStart);
    const newEndDate = new Date(newEnd);
    return payrolls.some(({ date_from, date_to }) => {
      const existingStart = new Date(date_from);
      const existingEnd = new Date(date_to);
      return (
        (newStartDate >= existingStart && newStartDate <= existingEnd) ||
        (newEndDate >= existingStart && newEndDate <= existingEnd) ||
        (newStartDate <= existingStart && newEndDate >= existingEnd)
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header heading="Payroll Process Management" />
      
      <div className="container mx-auto p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payroll Periods</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayrolls}</div>
              <p className="text-xs text-muted-foreground">
                All time payroll periods
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentMonth}</div>
              <p className="text-xs text-muted-foreground">
                Payroll periods this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payrolls</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayrolls}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting processing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Alert */}
        {status.message && (
          <Alert className={`mb-6 ${status.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
            <AlertCircle className={status.type === 'error' ? 'text-red-600' : 'text-green-600'} />
            <AlertTitle>
              {status.type === 'error' ? 'Error' : 'Success'}
            </AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Payroll Period</CardTitle>
            <CardDescription>Set up a new payroll processing period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Date From</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Date To</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={generatePayroll}
                disabled={isLoading}
                className="flex gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Generate Period
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Periods</CardTitle>
            <CardDescription>Manage your payroll processing periods</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Payroll ID</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.map((payroll) => (
                  <TableRow key={payroll._id}>
                    <TableCell className="font-medium">{payroll.payroll_id}</TableCell>
                    <TableCell>
                      {format(new Date(payroll.date_from), "MMM dd, yyyy")} - {format(new Date(payroll.date_to), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      Week {payroll.week_no}, {payroll.year}
                    </TableCell>
                    <TableCell>
                      <Badge variant={payroll.isProcessed ? "success" : "secondary"}>
                        {payroll.isProcessed ? "Processed" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Payroll Period</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this payroll period? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePayrollPeriod(payroll._id)}
                              className="bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
