"use client";
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
import { Loader2, AlertCircle, Trash2, Calendar as CalendarIcon, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DateRangePicker = ({ selectedRange, onRangeChange }) => {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState(selectedRange);

  useEffect(() => {
    if (range?.from && range?.to) {
      setOpen(false);
      onRangeChange(range);
    }
  }, [range]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {range?.from ? (
            range.to ? (
              `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd")}`
            ) : (
              format(range.from, "MMM dd, yyyy")
            )
          ) : (
            <span>Select date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
          required
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  );
};

export default function PayrollProcessPage() {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "CLIENT-001";
  const [payrolls, setPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({});
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
    if (payrolls.length > 0) calculateStats();
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
      setStatus({ type: "success", message: "Payroll periods loaded" });
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
      setStatus({ type: "success", message: "Payroll period deleted" });
      fetchPayrollProcesses();
    } catch (error) {
      setStatus({ type: "error", message: "Delete failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePayroll = async () => {
    if (!dateRange.from || !dateRange.to) {
      setStatus({ type: "error", message: "Select date range" });
      return;
    }

    if (dateRange.from > dateRange.to) {
      setStatus({ type: "error", message: "Invalid date range" });
      return;
    }

    if (isDateRangeOverlapping(dateRange.from, dateRange.to)) {
      setStatus({ type: "error", message: "Date range overlaps" });
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post("/api/payroll/payroll-process", {
        date_from: dateRange.from,
        date_to: dateRange.to,
        employerId,
      });
      
      if (data.success) {
        setStatus({ type: "success", message: "Payroll generated!" });
        fetchPayrollProcesses();
        setDateRange({});
      }
    } catch (error) {
      setStatus({ type: "error", message: "Generation failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const isDateRangeOverlapping = (newStart, newEnd) => {
    return payrolls.some(({ date_from, date_to }) => {
      const existingStart = new Date(date_from);
      const existingEnd = new Date(date_to);
      return (
        (newStart >= existingStart && newStart <= existingEnd) ||
        (newEnd >= existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header heading="Payroll Process Management" />
      
      <div className="container mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(stats).map(([key, value]) => (
            <Card key={key} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <CardTitle className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {status.message && (
          <Alert className={`mb-6 ${status.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <AlertCircle className={`h-4 w-4 ${status.type === 'error' ? 'text-red-600' : 'text-green-600'}`} />
            <AlertDescription className={`${status.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {status.message}
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg">Create Payroll Period</CardTitle>
            <CardDescription className="text-sm">Select date range for payroll processing</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="w-full">
                <DateRangePicker
                  selectedRange={dateRange}
                  onRangeChange={setDateRange}
                />
              </div>
              <Button 
                onClick={generatePayroll}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg">Payroll Periods</CardTitle>
            <CardDescription className="text-sm">Manage existing payroll periods</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="px-4">ID</TableHead>
                    <TableHead className="px-4">Date Range</TableHead>
                    <TableHead className="px-4">Period</TableHead>
                    <TableHead className="px-4">Status</TableHead>
                    <TableHead className="px-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.map((payroll) => (
                    <TableRow key={payroll._id} className="hover:bg-muted/50">
                      <TableCell className="px-4 font-medium">{payroll.payroll_id}</TableCell>
                      <TableCell className="px-4">
                        {format(new Date(payroll.date_from), "MMM dd")} - {format(new Date(payroll.date_to), "MMM dd, y")}
                      </TableCell>
                      <TableCell className="px-4">
                        Week {payroll.week_no}, {payroll.year}
                      </TableCell>
                      <TableCell className="px-4">
                        <Badge variant={payroll.isProcessed ? "default" : "secondary"} className="text-xs">
                          {payroll.isProcessed ? "Processed" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-red-50">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the payroll period.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePayrollPeriod(payroll._id)}
                                className="bg-red-600 hover:bg-red-700"
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}