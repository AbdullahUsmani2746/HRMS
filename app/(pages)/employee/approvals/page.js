"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  CalendarDays,
  Search,
  RefreshCcw,
  AlertCircle,
  Filter,
  Loader2,
} from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import Header from "@/components/breadcumb";

const DatePicker = ({ selectedDate, onDateChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* <Button
          variant="outline"
          className="w-[200px] pl-3 text-left font-normal"
        >
          {selectedDate ? (
            format(new Date(selectedDate), "MMM d, yyyy")
          ) : (
            <span className="text-muted-foreground flex items-center gap-2 hover:text-background">
              <CalendarDays className="h-4 w-4" />
              Pick a date
            </span>
          )}
        </Button> */}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate ? new Date(selectedDate) : undefined}
          onSelect={(date) => {
            onDateChange(date);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

const StatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
    >
      {status}
    </span>
  );
};

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-4">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-lg font-medium">Loading approvals...</p>
    </div>
  </div>
);

const EmptyState = ({ onRefresh }) => (
  <div className="text-center py-12">
    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
      <AlertCircle className="h-10 w-10 text-muted-foreground" />
    </div>
    <h3 className="mt-4 text-lg font-semibold">No Pending Approvals</h3>
    <p className="mt-2 text-sm text-muted-foreground">
      There are no pending approval requests at the moment.
    </p>
    <Button onClick={onRefresh} className="mt-4" variant="outline">
      <RefreshCcw className="mr-2 h-4 w-4" />
      Refresh
    </Button>
  </div>
);

const Approvals = () => {
  const { data: session } = useSession();
  const employeeId = session?.user?.username || "001-0001";

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchEmployeeName, setSearchEmployeeName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [payrollPeriods, setPayrollPeriods] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const response = await axios.get(`/api/payroll/payroll-process?employerId=CLIENT-${employeeId.split("-")[0]}`);
        setPayrollPeriods(response.data.data);
        if (response.data.length > 0 && !selectedPayroll) {
          setIsDialogOpen(true);
        }
      } catch (error) {
        toast.error("Failed to fetch payroll periods");
      }
    };
    fetchPeriods();
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const managerResponse = await axios.get(
        `/api/employees/manager/specificID?employeeId=${employeeId}`
      );
      const { _id, clientId } = managerResponse.data.data[0];

      const employeeResponse = await axios.get(
        `/api/employees?managerId=${_id}`
      );
      const employees = employeeResponse.data.data;

      const allRecords = [];

      for (const employee of employees) {
        try {
          let attendanceRecords = [];
          try {
            const attendanceResponse = await axios.get(
              `/api/users/attendance/${employee.employeeId}`
            );
            let filteredAttendance = attendanceResponse.data.filter(
              (record) => record.checkOutTime && record.status === "Pending"
            );
            if (selectedPayroll) {
              const payroll = payrollPeriods.find(
                (p) => p.payroll_id.toString() === selectedPayroll
              );
              if (payroll) {
                filteredAttendance = filteredAttendance.filter((record) => {
                  const recordDate = new Date(record.date);
                  return (
                    recordDate >= new Date(payroll.date_from) &&
                    recordDate <= new Date(payroll.date_to)
                  );
                });
              }
            }
            attendanceRecords = filteredAttendance.map((record) => ({
              ...record,
              type: "attendance",
              employeeId: employee.employeeId,
              firstName: employee.firstName,
              surname: employee.surname,
            }));
          } catch (error) {
            console.log(`No attendance records for ${employee.employeeId}`);
          }

          let periodicAttendanceRecords = [];
          try {
            const periodicResponse = await axios.get(
              `/api/employees/periodicAttendance/?employerId=${clientId}`
            );
            let filteredPeriodic = periodicResponse.data.data.filter(
              (record) =>
                record.status === "Pending" && record.employeeId === employee.employeeId
            );
            if (selectedPayroll) {
              const payroll = payrollPeriods.find(
                (p) => p.payroll_id.toString() === selectedPayroll
              );
              if (payroll) {
                filteredPeriodic = filteredPeriodic.filter((record) => {
                  const [startStr, endStr] = record.dateRange.split(" to ");
                  const startDate = new Date(startStr);
                  console.log(startDate)

                  const endDate = new Date(endStr);
                  const payrollStart = new Date(payroll.date_from);
                  console.log(payrollStart)

                  const payrollEnd = new Date(payroll.date_to);
                  return startDate <= payrollEnd && endDate >= payrollStart;
                });
              }
            }
            periodicAttendanceRecords = filteredPeriodic.map((record) => ({
              ...record,
              type: "periodicAttendance",
              employeeId: employee.employeeId,
              firstName: employee.firstName,
              surname: employee.surname,
            }));
          } catch (error) {
            console.log(`No periodic attendance records for ${employee.employeeId}`);
          }

          allRecords.push(...attendanceRecords, ...periodicAttendanceRecords);
        } catch (error) {
          console.error(`Error processing employee ${employee.employeeId}:`, error);
        }
      }

      setAttendanceData(allRecords);
    } catch (error) {
      setError("Failed to fetch approval data. Please try again later.");
      toast.error("Error loading approvals");
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, selectedPayroll, payrollPeriods]);

  useEffect(() => {
    if (selectedPayroll) {
      fetchData();
    }
  }, [fetchData, selectedPayroll]);

  const handleStatusChange = async (recordId, newStatus, type) => {
    setIsUpdating(true);

    const updatedData = attendanceData.map((record) =>
      record._id === recordId ? { ...record, status: newStatus, rejectionReason } : record
    );
    setAttendanceData(updatedData);

    try {
      const apiEndpoint =
        type === "attendance"
          ? `/api/users/attendance/${recordId}`
          : `/api/employees/periodicAttendance/${recordId}`;

      await axios.put(apiEndpoint, { 
        _id: recordId, 
        status: newStatus,
        rejectionReason
      });

      if (newStatus === "Approved") {
        setAttendanceData((prev) =>
          prev.filter((record) => record._id !== recordId)
        );
      }

      toast.success(`Successfully ${newStatus.toLowerCase()} the request`);
    } catch (error) {
      setAttendanceData((prev) =>
        prev.map((record) =>
          record._id === recordId ? { ...record, status: "Pending" } : record
        )
      );
      toast.error("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredData = attendanceData.filter((record) => {
    const matchesName = searchEmployeeName
      ? `${record.firstName} ${record.surname}`.toLowerCase().includes(searchEmployeeName.toLowerCase())
      : true;

    const matchesDate = searchDate
      ? format(new Date(record.date), "yyyy-MM-dd") === format(new Date(searchDate), "yyyy-MM-dd")
      : true;

    return matchesName && matchesDate;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  
    return (
      <>
      <Header heading="Approvals"/>
      <div className="min-h-screen ">
        {/* Dialog for selecting payroll period */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Payroll Period</DialogTitle>
              <DialogDescription>
                Please select a payroll period to view the approval requests.
              </DialogDescription>
            </DialogHeader>
            <Select
              onValueChange={(value) => {
                setSelectedPayroll(value);
                setIsDialogOpen(false);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a payroll period" />
              </SelectTrigger>
              <SelectContent>
                {payrollPeriods.map((period) => (
                  <SelectItem key={period.payroll_id} value={period.payroll_id.toString()}>
                    {format(new Date(period.date_from), "MMM d, yyyy")} -{" "}
                    {format(new Date(period.date_to), "MMM d, yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DialogContent>
        </Dialog>
  
        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Approval Requests
                  </CardTitle>
                  <CardDescription>
                    Manage attendance and periodic attendance approval requests
                  </CardDescription>
                </div>
                <Button
                  onClick={fetchData}
                  variant="outline"
                  disabled={isLoading}
                  className="gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Error alert */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
  
              {/* Filters */}
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by Employee Name"
                      value={searchEmployeeName}
                      onChange={(e) => setSearchEmployeeName(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <DatePicker
                  selectedDate={searchDate}
                  onDateChange={(date) => setSearchDate(date)}
                />
                <Select value={selectedPayroll} onValueChange={setSelectedPayroll}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Payroll Period" />
                  </SelectTrigger>
                  <SelectContent>
                    {payrollPeriods.map((period) => (
                      <SelectItem key={period.payroll_id} value={period.payroll_id.toString()}>
                        {format(new Date(period.date_from), "MMM d, yyyy")} -{" "}
                        {format(new Date(period.date_to), "MMM d, yyyy")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Rows per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
  
              {/* Table or loading/empty state */}
              <AnimatePresence>
                {isLoading ? (
                  <LoadingOverlay />
                ) : paginatedData.length === 0 ? (
                  <EmptyState onRefresh={fetchData} />
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Employee</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.map((record) => (
                          <motion.tr
                            key={record._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="group hover:bg-muted/50"
                          >
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {record.firstName} {record.surname}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {record.employeeId}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {record.type === "attendance" ? (
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {format(new Date(record.date), "MMM d, yyyy")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Check-in:{" "}
                                    {format(
                                      new Date(record.checkInTime),
                                      "hh:mm a"
                                    )}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Check-out:{" "}
                                    {format(
                                      new Date(record.checkOutTime),
                                      "hh:mm a"
                                    )}
                                  </span>
                                </div>
                              ) : (
                                <HoverCard>
                                  <HoverCardTrigger className="cursor-help">
                                    {`
                                    ${ format(new Date(record.dateRange.split(" to ")[0]), "MMM dd, yyyy")}
                                    to
                                    ${ format(new Date(record.dateRange.split(" to ")[1]), "MMM dd, yyyy")}

                                    `}
                                   
                                  </HoverCardTrigger>
                                  <HoverCardContent>
                                    <div className="flex flex-col gap-1">
                                      <span className="font-medium">
                                        Periodic Attendance
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        Date range for periodic attendance record
                                      </span>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {record.type === "attendance"
                                  ? "Daily"
                                  : "Periodic"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={record.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {/* Approve Dialog */}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="hidden group-hover:inline-flex"
                                      disabled={isUpdating}
                                    >
                                      <Check className="h-4 w-4 text-green-500" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Confirm Approval</DialogTitle>
                                      <DialogDescription>
                                        Are you sure you want to approve this
                                        attendance request?
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <div className="flex justify-end gap-2 mt-4">
                                          <Button variant="outline">
                                            Cancel
                                          </Button>
                                          <Button
                                            onClick={() => {
                                              handleStatusChange(
                                                record._id,
                                                "Approved",
                                                record.type
                                              );
                                            }}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            Confirm Approval
                                          </Button>
                                        </div>
                                      </DialogClose>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
  
                                {/* Reject Dialog */}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="hidden group-hover:inline-flex"
                                      disabled={isUpdating}
                                    >
                                      <X className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reject Attendance Request</DialogTitle>
                                      <DialogDescription>
                                        Please provide a reason for rejecting this attendance request.
                                        This will be visible to the employee.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="my-4">
                                      <label
                                        htmlFor="rejectionReason"
                                        className="block text-sm font-medium mb-2"
                                      >
                                        Rejection Reason
                                      </label>
                                      <textarea
                                        id="rejectionReason"
                                        className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
                                        placeholder="Enter the reason for rejection..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                      />
                                    </div>
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <div className="flex justify-end gap-2 mt-4">
                                          <Button
                                            variant="outline"
                                            onClick={() => setRejectionReason("")}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            onClick={() => {
                                              if (!rejectionReason.trim()) {
                                                toast.error("Please provide a rejection reason");
                                                return;
                                              }
                                              handleStatusChange(
                                                record._id,
                                                "Rejected",
                                                record.type,
                                                rejectionReason.trim()
                                              );
                                            }}
                                          >
                                            Confirm Rejection
                                          </Button>
                                        </div>
                                      </DialogClose>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </AnimatePresence>
  
              {/* Pagination */}
              {paginatedData.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                    {filteredData.length} results
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            currentPage > 1 && setCurrentPage((prev) => prev - 1)
                          }
                          disabled={currentPage === 1}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, index) => (
                        <PaginationItem key={index}>
                          <PaginationLink
                            onClick={() => setCurrentPage(index + 1)}
                            isActive={currentPage === index + 1}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            currentPage < totalPages &&
                            setCurrentPage((prev) => prev + 1)
                          }
                          disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </>
    );
  };
  
  export default Approvals;