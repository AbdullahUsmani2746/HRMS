"use client";
import { useState, useEffect, useMemo } from "react";
import { DateRange } from "react-day-picker";
// import { isDateRange } from "react-day-picker";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Filter,
  SortDesc,
  Save,
  Search,
  ChevronDown,
  Plus,
  Clock8,
  Coffee,
  CalendarOff,
  User,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import LoadingSpinner from "@/components/spinner";
import Header from "@/components/breadcumb";
import axios from "axios";
import { useSession } from "next-auth/react";
import { FaBullseye } from "react-icons/fa";

// Animation Variants
const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  },
};

// Status Icon Component
const StatusIcon = ({ status }) => {
  const statusIcons = {
    Pending: <PauseCircle className="text-yellow-500 w-5 h-5" />,
    Approved: <CheckCircle2 className="text-green-500 w-5 h-5" />,
    Rejected: <XCircle className="text-red-500 w-5 h-5" />,
  };

  return statusIcons[status] || null;
};

// Attendance Statistics Card
const AttendanceStatsCard = ({ data }) => {
  const calculateStats = useMemo(() => {
    if (!data.length)
      return {
        totalHoursWorked: 0,
        averageBreakHours: 0,
        totalLeaves: 0,
      };

    return {
      totalHoursWorked: data.reduce(
        (sum, record) => sum + parseFloat(record.totalWorkingHours),
        0
      ),
      averageBreakHours:
        data.reduce(
          (sum, record) => sum + parseFloat(record.totalBreakHours),
          0
        ) / data.length,
      totalLeaves: data.reduce(
        (sum, record) =>
          parseInt(sum) + parseInt(record.leaves === "" ? 0 : record.leaves),
        0
      ),
    };
  }, [data]);

  return (
    <motion.div
      className="bg-foreground rounded-xl shadow-md p-6 space-y-2 border border-background/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      variants={ANIMATION_VARIANTS.item}
    >
      <h3 className="text-lg font-semibold text-background flex items-center gap-2">
        <Clock className="w-6 h-6" /> Attendance Overview
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="text-left">
          <p className="text-background/70 text-sm">Total Hours Worked</p>
          <p className="text-2xl font-bold text-background">
            {calculateStats.totalHoursWorked.toFixed(1)}
          </p>
        </div>
        <div className="text-left">
          <p className="text-background/70 text-sm">Avg. Break Hours</p>
          <p className="text-2xl font-bold text-background">
            {calculateStats.averageBreakHours.toFixed(1)}
          </p>
        </div>
        <div className="text-left">
          <p className="text-background/70 text-sm">Total Leaves</p>
          <p className="text-2xl font-bold text-background">
            {calculateStats.totalLeaves}
          </p>
        </div>
      </div>
    </motion.div>
  );
};


// DatePickerWithRange Component
const DateRangePicker = ({ selectedRange, onRangeChange }) => {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState(selectedRange);


  // Update both local and parent state
  const handleSelect = (range) => {
    setRange(range);
    onRangeChange(range);
  };
  // Close popover when both dates are selected
  useEffect(() => {
    if (selectedRange?.from && selectedRange?.to) {
      setOpen(false);
    }
  }, [selectedRange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="justify-start w-full bg-background/5 border-background/10 text-background">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedRange?.from && selectedRange?.to ? (
            <>
              {format(selectedRange.from, "yyyy-MM-dd")} -{" "}
              {format(selectedRange.to, "yyyy-MM-dd")}
            </>
          ) : (
            "Pick a date range"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleSelect}
          required
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

// FormInput Component with Error Handling
const FormInput = ({
  label,
  icon,
  id,
  type,
  placeholder,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm text-background/60" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40">
            {icon}
          </div>
        )}
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          className={`${
            icon ? "pl-10" : ""
          } bg-background/5 border-background/10 text-background placeholder:text-background/40 ${
            error ? "border-red-500 pr-10" : ""
          }`}
          value={value}
          onChange={onChange}
        />
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// Modal component with animation
const Modal = ({ onClose, children }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          variants={ANIMATION_VARIANTS.container}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="w-full max-w-2xl mx-auto"
        >
          <Card className="bg-foreground border-white/10 shadow-xl">
            {children}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Attendance Component
const PeriodicAttendanceComponent = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "default-employer";
  const itemsPerPage = 20;

  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const [filterOptions, setFilterOptions] = useState({
    status: "",
    dateRange: null,
    sortBy: "date",
  });

  const [newAttendance, setNewAttendance] = useState({
    employeeId: "",
    dateRange: undefined,
    hoursWorked: "",
    breakHours: "",
    leaves: "0",
    status: "Pending",
  });

  const [formErrors, setFormErrors] = useState({
    employeeId: "",
    dateRange: "",
    hoursWorked: "",
    breakHours: "",
    leaves: "",
  });

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!newAttendance.employeeId) {
      errors.employeeId = "Employee is required";
      isValid = false;
    }

    if (!newAttendance.dateRange?.from || !newAttendance.dateRange?.to) {
      errors.dateRange = "Date range is required";
      isValid = false;
    }

    if (!newAttendance.hoursWorked) {
      errors.hoursWorked = "Working hours are required";
      isValid = false;
    } else if (parseFloat(newAttendance.hoursWorked) <= 0) {
      errors.hoursWorked = "Hours must be greater than 0";
      isValid = false;
    }

    if (!newAttendance.breakHours) {
      errors.breakHours = "Break hours are required";
      isValid = false;
    } else if (parseFloat(newAttendance.breakHours) < 0) {
      errors.breakHours = "Break hours cannot be negative";
      isValid = false;
    }

    if (newAttendance.leaves && parseInt(newAttendance.leaves) < 0) {
      errors.leaves = "Leaves cannot be negative";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAddAttendance = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const { from, to } = newAttendance.dateRange;

      // Format the date range
      const formattedDateRange = `${new Date(from)} to ${new Date(to)}`;

      // Prepare the payload
      const attendancePayload = {
        employeeId: newAttendance.employeeId,
        clientId: employerId,
        dateRange: formattedDateRange,
        totalWorkingHours: newAttendance.hoursWorked,
        totalBreakHours: newAttendance.breakHours,
        leaves: newAttendance.leaves,
        status: newAttendance.status,
      };

      // Send data to the API
      const response = await axios.post(
        `/api/employees/periodicAttendance`,
        attendancePayload
      );

      console.log("Attendance added successfully:", response.data);

      // Fetch updated attendance data
      fetchAttendanceData();

      // Close modal and reset form
      closeModal();
    } catch (error) {
      console.error("Error adding attendance:", error);
      setIsLoading(false);

      // Handle specific API errors here if needed
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setNewAttendance({
      employeeId: "",
      dateRange: undefined,
      hoursWorked: "",
      breakHours: "",
      leaves: "0",
      status: "Pending",
    });
    setFormErrors({});
  };

  const openModal = () => {
    setModalOpen(true);
  };

  // Filtered and Sorted Data
  useEffect(() => {
    let result = [...attendanceData];

    // Filter by search term
    if (searchTerm) {
      result = result.filter((record) => {
        // Find the employee that matches this record's employeeId
        const employee = employees.find(
          (emp) => emp.employeeId === record.employeeId
        );

        // If employee exists and their name includes the search term, keep this record
        return (
          employee &&
          employee.firstName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    // Filter by Status
    if (filterOptions.status) {
      result = result.filter(
        (record) => record.status === filterOptions.status
      );
    }

    // Filter by Date Range
    if (filterOptions.dateRange?.from && filterOptions.dateRange?.to) {
      result = result.filter((record) => {
        const recordDatefrom = record.dateRange.split(" to ")[0];
        const recordDateto = record.dateRange.split(" to ")[1];

        return (
          new Date(recordDatefrom).getTime() >=
            new Date(filterOptions.dateRange.from).getTime() &&
          new Date(recordDateto).getTime() <=
            new Date(filterOptions.dateRange.to).getTime()
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      const sortDirection = sortOrder === "asc" ? 1 : -1;

      switch (filterOptions.sortBy) {
        case "hoursWorked":
          return (
            sortDirection *
            (parseFloat(b.totalWorkingHours) - parseFloat(a.totalWorkingHours))
          );
        case "date":
        default:
          return (
            sortDirection *
            (new Date(b.dateRange.split(" to ")[0]) -
              new Date(a.dateRange.split(" to ")[0]))
          );
      }
    });

    setFilteredData(result);
  }, [attendanceData, filterOptions, searchTerm, sortOrder]);

  // Fetch Attendance Data
  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/employees/periodicAttendance?employerId=${employerId}`
      );
      setAttendanceData(response.data.data || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `/api/employees?employerId=${employerId}`
      );

      setEmployees(response.data.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
    fetchEmployees();
  }, [employerId]);

  // Pagination logic
  const totalPages =
    filteredData.length === 0
      ? 0
      : Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) items.push(i);
        items.push("ellipsis");
        items.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        items.push(1);
        items.push("ellipsis");
        for (let i = totalPages - 2; i <= totalPages; i++) items.push(i);
      } else {
        items.push(1);
        items.push("ellipsis");
        items.push(currentPage - 1);
        items.push(currentPage);
        items.push(currentPage + 1);
        items.push("ellipsis");
        items.push(totalPages);
      }
    }
    return items;
  };

  return (
    <>
      {isLoading ? (
        <LoadingSpinner
          variant="pulse"
          size="large"
          text="Processing..."
          fullscreen={true}
        />
      ) : (
        <>
          <Header heading="Time Entry Management" />

          <motion.div
            variants={ANIMATION_VARIANTS.container}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-background"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Card className="bg-foreground border-white/10 shadow-xl">
                <CardContent className="p-8">
                  {/* Header Section */}
                  <motion.div
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
                    variants={ANIMATION_VARIANTS.item}
                  >
                    <div className="space-y-2">
                      <h1 className="text-4xl font-bold text-background tracking-tight">
                        Time Entry Management
                      </h1>
                      <p className="text-background/70">
                        Comprehensive overview of employee attendance and
                        working hours
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={openModal}
                        className="bg-background text-foreground hover:bg-background/90 transition-all duration-200 shadow-lg hover:shadow-background/20"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Attendance Time
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Stats and Filters */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Attendance Stats */}
                    <div className="lg:col-span-1">
                      <AttendanceStatsCard data={attendanceData} />
                    </div>

                    {/* Filters */}
                    <motion.div
                      className="lg:col-span-2 bg-foreground rounded-xl shadow-md p-6 border border-background/10"
                      variants={ANIMATION_VARIANTS.item}
                    >
                      {/* Search Bar */}
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-4 h-4" />
                          <Input
                            placeholder="Search Employees"
                            className="pl-10 bg-background/5 border-background/10 text-background placeholder:text-background/40 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Status Filter */}
                        <div>
                          <label className="block text-sm font-medium text-background/60 mb-2">
                            Filter by Status
                          </label>
                          <Select
                            value={filterOptions.status}
                            onValueChange={(value) =>
                              setFilterOptions((prev) => ({
                                ...prev,
                                status: value === "All" ? "" : value,
                              }))
                            }
                          >
                            <SelectTrigger className="bg-background/5 border-background/10 text-background placeholder:text-background/40">
                              <SelectValue placeholder="All Statuses">
                                {filterOptions.status || "All Statuses"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Statuses</SelectItem>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                          <label className="block text-sm font-medium text-background/60 mb-2">
                            Date Range
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start bg-background/5 border-background/10 text-background"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filterOptions.dateRange?.from ? (
                                  filterOptions.dateRange.to ? (
                                    <>
                                      {format(
                                        filterOptions.dateRange.from,
                                        "LLL dd"
                                      )}{" "}
                                      -{" "}
                                      {format(
                                        filterOptions.dateRange.to,
                                        "LLL dd"
                                      )}
                                    </>
                                  ) : (
                                    format(
                                      filterOptions.dateRange.from,
                                      "LLL dd, y"
                                    )
                                  )
                                ) : (
                                  <span>Date range</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="range"
                                selected={filterOptions.dateRange}
                                onSelect={(range) =>
                                  setFilterOptions((prev) => ({
                                    ...prev,
                                    dateRange: range,
                                  }))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Sort By */}
                        <div>
                          <label className="block text-sm font-medium text-background/60 mb-2">
                            Sort By
                          </label>
                          <div className="flex gap-2">
                            <Select
                              value={filterOptions.sortBy}
                              onValueChange={(value) =>
                                setFilterOptions((prev) => ({
                                  ...prev,
                                  sortBy: value,
                                }))
                              }
                            >
                              <SelectTrigger className="flex-1 bg-background/5 border-background/10 text-background">
                                <SelectValue>
                                  {filterOptions.sortBy === "date"
                                    ? "Date"
                                    : "Hours"}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="hoursWorked">
                                  Hours
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              onClick={() =>
                                setSortOrder(
                                  sortOrder === "asc" ? "desc" : "asc"
                                )
                              }
                              className="border-background/10 text-foreground hover:bg-background/5"
                            >
                              <ChevronDown
                                className={`h-4 w-4 transform transition-transform ${
                                  sortOrder === "desc" ? "rotate-180" : ""
                                }`}
                              />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Attendance Table */}
                  <motion.div
                    variants={ANIMATION_VARIANTS.container}
                    className="relative overflow-hidden rounded-lg border border-background/10"
                  >
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-background/10 bg-background/5">
                            <TableHead className="text-background font-medium py-5 px-6">
                              ID
                            </TableHead>
                            <TableHead className="text-background font-medium py-5 px-6">
                              Name
                            </TableHead>
                            <TableHead className="text-background font-medium py-5 px-6">
                              Date Range
                            </TableHead>
                            <TableHead className="text-background font-medium py-5 px-6">
                              Hours Worked
                            </TableHead>
                            <TableHead className="text-background font-medium py-5 px-6">
                              Break Hours
                            </TableHead>
                            <TableHead className="text-background font-medium py-5 px-6">
                              Leaves
                            </TableHead>
                            <TableHead className="text-background font-medium py-5 px-6">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {currentData.map((record, index) => (
                              <motion.tr
                                key={record._id}
                                variants={ANIMATION_VARIANTS.item}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="border-background/10 hover:bg-background/5 transition-colors"
                              >
                                <TableCell className="py-4 px-6 text-background">
                                  <div className="text-background">
                                    {record.employeeId}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-background">
                                  <div className="text-background">
                                    {(() => {
                                      const employee = employees.find(
                                        (emp) =>
                                          emp.employeeId === record.employeeId
                                      );
                                      return employee
                                        ? `${employee.firstName} ${employee.surname}`
                                        : "";
                                    })()}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-background">
                                  <div className="font-medium text-background">
                                    {`${new Date(
                                      record.dateRange.split(" to ")[0]
                                    ).toLocaleDateString()} to
                                    ${new Date(
                                      record.dateRange.split(" to ")[1]
                                    ).toLocaleDateString()} `}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-background">
                                  <div className="text-background">
                                    {record.totalWorkingHours} hrs
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-background">
                                  <div className="text-background">
                                    {record.totalBreakHours} hrs
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-background">
                                  <Badge
                                    variant="secondary"
                                    className="bg-background/20 text-background"
                                  >
                                    {record.leaves} days
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-4 px-6">
                                  <div className="flex items-center space-x-2">
                                    <Badge
                                      className={`text-white px-2 py-1 flex items-center gap-1.5 ${
                                        record.status === "Approved"
                                          ? "bg-[#A8E5A6]"
                                          : record.status === "Rejected"
                                          ? "bg-[#D0021B]"
                                          : record.status === "Pending"
                                          ? "bg-[#F5A623]"
                                          : ""
                                      }`}
                                    >
                                      <StatusIcon status={record.status} />
                                      {record.status}
                                    </Badge>
                                  </div>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {filteredData.length > 0 && (
                      <div className="mt-4 py-4 border-t border-background/10">
                        <Pagination>
                          <PaginationContent className="text-background">
                            <PaginationItem>
                              <PaginationPrevious
                                className={`text-background ${
                                  currentPage === 1
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-background/10"
                                }`}
                                onClick={() =>
                                  currentPage > 1 &&
                                  handlePageChange(currentPage - 1)
                                }
                              />
                            </PaginationItem>

                            {generatePaginationItems().map((item, index) => (
                              <PaginationItem key={index}>
                                {item === "ellipsis" ? (
                                  <PaginationEllipsis className="text-background" />
                                ) : (
                                  <PaginationLink
                                    className={`text-background ${
                                      currentPage === item
                                        ? "bg-background/20"
                                        : "hover:bg-background/10"
                                    }`}
                                    onClick={() => handlePageChange(item)}
                                    isActive={currentPage === item}
                                  >
                                    {item}
                                  </PaginationLink>
                                )}
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                className={`text-background ${
                                  currentPage === totalPages
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-background/10"
                                }`}
                                onClick={() =>
                                  currentPage < totalPages &&
                                  handlePageChange(currentPage + 1)
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </motion.div>

                  {/* Empty State */}
                  {filteredData.length === 0 && (
                    <motion.div
                      variants={ANIMATION_VARIANTS.item}
                      className="text-center py-12"
                    >
                      <p className="text-background/40 text-lg">
                        {searchTerm || filterOptions.status
                          ? "No attendance records found matching your search"
                          : "No attendance records added yet"}
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </>
      )}

      {/* Add Attendance Modal */}
      {modalOpen && (
        <Modal onClose={closeModal}>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-background tracking-tight">
              Add Attendance Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddAttendance();
              }}
              className="space-y-6"
            >
              <div className="space-y-4 p-4 rounded-lg bg-background/5 border border-background/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Employee ID as Select Box */}
                  <div className="space-y-2">
                    <label
                      className="text-sm text-background/60"
                      htmlFor="employeeId"
                    >
                      Employee
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40" />
                      <Select
                        value={newAttendance.employeeId}
                        onValueChange={(value) =>
                          setNewAttendance({
                            ...newAttendance,
                            employeeId: value,
                          })
                        }
                      >
                        <SelectTrigger className="pl-10 bg-background/5 border-background/10 text-background placeholder:text-background/40">
                          <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem
                              key={employee.employeeId}
                              value={employee.employeeId}
                            >
                              {employee.firstName} {employee.surname}(
                              {employee.employeeId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.employeeId && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.employeeId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <label
                      className="text-sm text-background/60"
                      htmlFor="dateRangePicker"
                    >
                      Date Range
                    </label>
                    <DateRangePicker
                      selectedRange={newAttendance.dateRange}
                      onRangeChange={(range) =>
                        setNewAttendance({
                          ...newAttendance,
                          dateRange: range,
                        })
                      }
                    />
                    {formErrors.dateRange && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.dateRange}
                      </p>
                    )}
                  </div>

                  {/* Hours Worked */}
                  <FormInput
                    label="Total Hours Worked"
                    icon={<Clock8 className="w-5 h-5" />}
                    id="hoursWorked"
                    type="number"
                    placeholder="Enter Hours Worked"
                    value={newAttendance.hoursWorked}
                    onChange={(e) =>
                      setNewAttendance({
                        ...newAttendance,
                        hoursWorked: e.target.value,
                      })
                    }
                    error={formErrors.hoursWorked}
                  />

                  {/* Break Hours */}
                  <FormInput
                    label="Total Break Hours"
                    icon={<Coffee className="w-5 h-5" />}
                    id="breakHours"
                    type="number"
                    placeholder="Enter Break Hours"
                    value={newAttendance.breakHours}
                    onChange={(e) =>
                      setNewAttendance({
                        ...newAttendance,
                        breakHours: e.target.value,
                      })
                    }
                    error={formErrors.breakHours}
                  />

                  {/* Total Leaves */}
                  <FormInput
                    label="Total Leaves"
                    icon={<CalendarOff className="w-5 h-5" />}
                    id="leaves"
                    type="number"
                    placeholder="Enter Leaves"
                    value={newAttendance.leaves}
                    onChange={(e) =>
                      setNewAttendance({
                        ...newAttendance,
                        leaves: e.target.value,
                      })
                    }
                    error={formErrors.leaves}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-background/10">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={closeModal}
                    variant="outline"
                    className="border-background/10 text-foreground hover:bg-background/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-background text-foreground hover:bg-background/90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Modal>
      )}
    </>
  );
};

export default PeriodicAttendanceComponent;
