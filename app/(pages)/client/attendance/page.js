"use client";
import { useState, useEffect, useMemo } from "react";
import { format, parseISO } from "date-fns";
import LoadingSpinner from "@/components/spinner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  PauseCircle,
  Filter, 
  SortDesc,
  Save
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import axios from "axios";
import { useSession } from "next-auth/react";
import Header from "@/components/breadcumb";

// Status Icon Component
const StatusIcon = ({ status }) => {
  const statusIcons = {
    "Pending": <PauseCircle className="text-yellow-500 w-5 h-5" />,
    "Approved": <CheckCircle2 className="text-green-500 w-5 h-5" />,
    "Rejected": <XCircle className="text-red-500 w-5 h-5" />
  };

  return statusIcons[status] || null;
};

// Attendance Statistics Card
const AttendanceStatsCard = ({ data }) => {
  const calculateStats = useMemo(() => {
    if (!data.length) return {
      totalHoursWorked: 0,
      averageBreakHours: 0,
      totalLeaves: 0
    };

    return {
      totalHoursWorked: data.reduce((sum, record) => sum + parseFloat(record.totalWorkingHours), 0),
      averageBreakHours: data.reduce((sum, record) => sum + parseFloat(record.totalBreakHours), 0) / data.length,
      totalLeaves: data.reduce((sum, record) => parseInt(sum) + parseInt(record.leaves === "" ? 0 : record.leaves), 0),
    };
  }, [data]);

  return (
    <motion.div 
      className="bg-card rounded-xl shadow-md p-6 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
        <Clock className="w-6 h-6" /> Attendance Overview
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Total Hours Worked</p>
          <p className="text-2xl font-bold text-primary">
            {calculateStats.totalHoursWorked.toFixed(1)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Avg. Break Hours</p>
          <p className="text-2xl font-bold text-primary">
            {calculateStats.averageBreakHours.toFixed(1)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Total Leaves</p>
          <p className="text-2xl font-bold text-primary">
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="justify-start w-full">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedRange?.from && selectedRange?.to ? (
            <>
              {format(new Date(selectedRange.from), "yyyy-MM-dd")} -{" "}
              {format(new Date(selectedRange.to), "yyyy-MM-dd")}
            </>
          ) : (
            "Pick a date range"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={selectedRange}
          onSelect={(range) => {
            onRangeChange(range);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

// Modal component with animation
const Modal = ({ onClose, children }) => {
  const ANIMATION_VARIANTS = {
    container: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.1 }
      },
      exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        variants={ANIMATION_VARIANTS.container}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-2xl mx-auto"
      >
        <Card className="bg-foreground border-white/10 shadow-xl">
          {children}
        </Card>
      </motion.div>
    </div>
  );
};

// Main Attendance Component
const PeriodicAttendanceComponent = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "default-employer";

  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [employees, setemployees] = useState([])
  const [filterOptions, setFilterOptions] = useState({
    status: "",
    dateRange: null,
    sortBy: "date"
  });


  // Mock employees data - replace with actual API call
  // const employees = [
  //   { id: "001-0001", name: "John Doe" },
  //   { id: "001-0002", name: "Jane Smith" },
  //   { id: "001-0003", name: "Michael Johnson" },
  //   { id: "001-0004", name: "Sarah Williams" },
  // ];

  const [newAttendance, setNewAttendance] = useState({
    employeeId: "001-0002",
    dateRange: undefined,
    hoursWorked: "",
    breakHours: "",
    leaves: "0",
    status: "Pending",
  });

  const handleAddAttendance = async () => {
    if (!newAttendance.dateRange || !newAttendance.hoursWorked || !newAttendance.breakHours) {
      console.error("Please fill in all required fields.");
      return;
    }
  
    try {
      const { from, to } = newAttendance.dateRange;
  
      // Format the date range as "1 Dec to 29 Dec"
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
      const response = await axios.post(`/api/employees/periodicAttendance`, attendancePayload);
  
      console.log("Attendance added successfully:", response.data);
  
      // Fetch updated attendance data
      fetchAttendanceData();
  
      // Close modal and reset form
      closeModal();
      setNewAttendance({
        employeeId: "001-0002",
        dateRange: undefined,
        hoursWorked: "",
        breakHours: "",
        leaves: "0",
        status: "Pending",
      });
    } catch (error) {
      console.error("Error adding attendance:", error);
    }
  };
  
  const closeModal = () => {
    setModalOpen(false);
  };

  const openModal = () => {
    setModalOpen(true);
  };

  // Filtered and Sorted Data
  useEffect(() => {
    let result = [...attendanceData];

    // Filter by Status
    if (filterOptions.status) {
      result = result.filter(record => record.status === filterOptions.status);
    }

    // Filter by Date Range
    if (filterOptions.dateRange?.from && filterOptions.dateRange?.to) {
      result = result.filter(record => {
        const recordDate = parseISO(record.dateRange.split(" to ")[0]);
        return recordDate >= filterOptions.dateRange.from && 
               recordDate <= filterOptions.dateRange.to;
      });
    }

    // Sort 
    result.sort((a, b) => {
      switch(filterOptions.sortBy) {
        case "hoursWorked":
          return parseFloat(b.totalWorkingHours) - parseFloat(a.totalWorkingHours);
        case "date":
        default:
          return new Date(b.dateRange.split(" to ")[0]) - new Date(a.dateRange.split(" to ")[0]);
      }
    });

    setFilteredData(result);
  }, [attendanceData, filterOptions]);

  // Fetch Attendance Data
  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/employees/periodicAttendance?employerId=${employerId}`);
      setAttendanceData(response.data.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`/api/employees?employerId=${employerId}`);
      setemployees(response.data.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }

  useEffect(() => {
    fetchAttendanceData();
    fetchEmployees();
  }, [employerId]);

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
          <Header heading="Time Entry Management"/>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-background text-foreground p-8"
          >
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-8 flex justify-between items-center"
              >
                <div>
                  <h1 className="text-4xl font-extrabold text-primary mb-2">
                    Time Entry Management
                  </h1>
                  <p className="text-muted-foreground">
                    Comprehensive overview of employee attendance and working hours
                  </p>
                </div>
                <Button 
                  onClick={openModal} 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Attendance Time
                </Button>
              </motion.div>

              {/* Stats and Filters */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                {/* Attendance Stats */}
                <div className="col-span-2">
                  <AttendanceStatsCard data={attendanceData} />
                </div>

                {/* Filters */}
                <motion.div 
                  className="col-span-2 bg-card rounded-xl shadow-md p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center space-x-4">
                    {/* Status Filter */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Filter by Status
                      </label>
                      <Select 
                        value={filterOptions.status}
                        onValueChange={(value) => setFilterOptions(prev => ({
                          ...prev, 
                          status: value
                        }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Statuses">
                            {filterOptions.status || "All Statuses"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {/* <SelectItem value="">All Statuses</SelectItem> */}
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Range Filter */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Date Range
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filterOptions.dateRange?.from ? (
                              filterOptions.dateRange.to ? (
                                <>
                                  {format(filterOptions.dateRange.from, "LLL dd, y")} -{" "}
                                  {format(filterOptions.dateRange.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(filterOptions.dateRange.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="range"
                            selected={filterOptions.dateRange}
                            onSelect={(range) => setFilterOptions(prev => ({
                              ...prev, 
                              dateRange: range
                            }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Sort By */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Sort By
                      </label>
                      <Select 
                        value={filterOptions.sortBy}
                        onValueChange={(value) => setFilterOptions(prev => ({
                          ...prev, 
                          sortBy: value
                        }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort by Date">
                            {filterOptions.sortBy === "date" ? "Date" : "Hours Worked"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="hoursWorked">Hours Worked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Attendance Table */}
              <motion.div 
                className="bg-card rounded-xl shadow-md overflow-hidden"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      {["Employee ID","Date Range", "Hours Worked", "Break Hours", "Leaves", "Status"].map((header) => (
                        <th 
                          key={header} 
                          className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredData.map((record, index) => (
                        <motion.tr
                          key={record._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ 
                            delay: index * 0.05,
                            duration: 0.3 
                          }}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm">
                            <div className="text-muted-foreground">
                              {record.employeeId}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="font-medium text-foreground">
                              {`${new Date(record.dateRange.split(" to ")[0]).toLocaleDateString()} to
                              ${new Date(record.dateRange.split(" to ")[1]).toLocaleDateString()} `}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="text-muted-foreground">
                              {record.totalWorkingHours} hrs
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="text-muted-foreground">
                              {record.totalBreakHours} hrs
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Badge variant="secondary">
                              {record.leaves} days
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <StatusIcon status={record.status} />
                              <Badge 
                                variant={
                                  record.status === "Approved" ? "success" :
                                  record.status === "Rejected" ? "destructive" :
                                  "secondary"
                                }
                              >
                                {record.status}
                              </Badge>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
      
      {/* Add Attendance Modal - Updated with new style */}
      {modalOpen && (
        <Modal onClose={closeModal}>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-background">
              Add Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleAddAttendance(); }} className="space-y-6">
              <div className="space-y-4 p-4 rounded-lg bg-background/5 border border-background/10">
                <div className="grid grid-cols-2 gap-4">
                  {/* Employee ID as Select Box */}
                  <div className="space-y-2">
                    <label className="text-sm text-background/60" htmlFor="employeeId">
                      Employee ID
                    </label>
                    <Select
                      value={newAttendance.employeeId}
                      onValueChange={(value) => setNewAttendance({
                        ...newAttendance,
                        employeeId: value,
                      })}
                    >
                      <SelectTrigger className="bg-background/5 border-background/10 text-background placeholder:text-background/40">
                        <SelectValue placeholder="Select Employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.employeeId} value={employee.employeeId}>
                            {employee.firstName} {employee.surname}({employee.employeeId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <label className="text-sm text-background/60" htmlFor="dateRangePicker">
                      Date Range
                    </label>
                    <DateRangePicker
                      selectedRange={newAttendance.dateRange}
                      onRangeChange={(range) => setNewAttendance({
                        ...newAttendance,
                        dateRange: range,
                      })}
                    />
                  </div>

                  {/* Hours Worked */}
                  <div className="space-y-2">
                    <label className="text-sm text-background/60" htmlFor="hoursWorked">
                      Total Hours Worked
                    </label>
                    <div className="relative">
                      <Input
                        id="hoursWorked"
                        type="number"
                        placeholder="Enter Hours Worked"
                        className="bg-background/5 border-background/10 text-background placeholder:text-background/40"
                        value={newAttendance.hoursWorked}
                        onChange={(e) => setNewAttendance({
                          ...newAttendance,
                          hoursWorked: e.target.value,
                        })}
                      />
                    </div>
                  </div>

                  {/* Break Hours */}
                  <div className="space-y-2">
                    <label className="text-sm text-background/60" htmlFor="breakHours">
                      Total Break Hours
                    </label>
                    <div className="relative">
                      <Input
                        id="breakHours"
                        type="number"
                        placeholder="Enter Break Hours"
                        className="bg-background/5 border-background/10 text-background placeholder:text-background/40"
                        value={newAttendance.breakHours}
                        onChange={(e) => setNewAttendance({
                          ...newAttendance,
                          breakHours: e.target.value,
                        })}
                      />
                    </div>
                  </div>

                  {/* Total Leaves */}
                  <div className="space-y-2">
                    <label className="text-sm text-background/60" htmlFor="leaves">
                      Total Leaves
                    </label>
                    <div className="relative">
                      <Input
                        id="leaves"
                        type="number"
                        placeholder="Enter Leaves"
                        className="bg-background/5 border-background/10 text-background placeholder:text-background/40"
                        value={newAttendance.leaves}
                        onChange={(e) => setNewAttendance({
                          ...newAttendance,
                          leaves: e.target.value,
                        })}
                      />
                    </div>
                  </div>

                 
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