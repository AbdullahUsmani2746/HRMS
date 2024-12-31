"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
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
import LoadingSpinner from "@/components/spinner";
import { format } from "date-fns";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/breadcumb";
const DatePicker = ({ selectedDate, onDateChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className=" justify-start">
          {selectedDate
            ? format(new Date(selectedDate), "yyyy-MM-dd")
            : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate ? new Date(selectedDate) : undefined}
          onSelect={(date) => {
            onDateChange(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

const Approvals = () => {
  const { data: session } = useSession();
  const employeeId = "001-0001"; // Replace with dynamic session or hardcoded ID for testing
  const router = useRouter();

  const handleDateChange = (date) => {
    setSearchDate(format(new Date(date), "yyyy-MM-dd"));
  };
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchEmployeeId, setSearchEmployeeId] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleStatusChange = async (attendanceId, newStatus) => {
    try {
      // Update the status on the server (demo API call for now)
      const response = await axios.put(`/api/users/attendance/${attendanceId}`, {
        newStatus,
      });     
       console.log(`Status updated for ${attendanceId} to ${newStatus}`);
       return response.data;

    } catch (error) {
      console.error("Error updating status:", error);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch manager's department
        const managerResponse = await axios.get(
          `/api/employees/manager/specificID?employeeId=${employeeId}`
        );
        const { _id } = managerResponse.data.data[0];

        // Fetch employees under the manager's department
        const employeeResponse = await axios.get(
          `/api/employees?managerId=${_id}`
        );
        const employees = employeeResponse.data.data;

        // Fetch attendance and flatten data
        const attendanceRecords = [];
        for (const employee of employees) {
          const attendanceResponse = await axios.get(
            `/api/users/attendance/${employee.employeeId}`
          );
          const records = attendanceResponse.data.map((record) => ({
            ...record,
            employeeId: employee.employeeId,
            firstName: employee.firstName,
            surname: employee.surname,
          }));
          attendanceRecords.push(...records);
        }

        setAttendanceData(attendanceRecords);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  // Pagination
  const totalPages = Math.ceil(attendanceData.length / pageSize);
  const paginatedData = attendanceData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Search and filter
  const filteredData = paginatedData.filter((record) => {
    const matchesEmployeeId = searchEmployeeId
      ? record.employeeId.toLowerCase().includes(searchEmployeeId.toLowerCase())
      : true;
      const matchesDate = searchDate
      ? new Date(record.date)
          .toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }) === searchDate
      : true;

    return matchesEmployeeId && matchesDate;
  });

  return (
    <>
      <Header heading="Approvals" />
      <div className="p-4">
        {/* <h1 className="text-2xl mb-4">Attendance History</h1> */}

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Search Inputs */}
            <div className="mb-4 flex  gap-4">
              <Input
                className="w-[250px]"
                type="text"
                placeholder="Search by Employee ID"
                value={searchEmployeeId}
                onChange={(e) => setSearchEmployeeId(e.target.value)}
              />
              <DatePicker
                selectedDate={searchDate}
                onDateChange={handleDateChange}
              />
            </div>
            {/* Attendance Table */}
            <Table className="shadow-md rounded-lg border-separate">
              <TableHeader>
                <TableRow className="bg-foreground text-left">
                  <TableHead className="px-4 py-2 font-semibold text-white">
                    ID
                  </TableHead>
                  <TableHead className="px-4 py-2 font-semibold text-white">
                    Name
                  </TableHead>
                  <TableHead className="px-4 py-2 font-semibold text-white">
                    Date
                  </TableHead>
                  <TableHead className="px-4 py-2 font-semibold text-white">
                    Time In
                  </TableHead>
                  <TableHead className="px-4 py-2 font-semibold text-white">
                    Time Out
                  </TableHead>
                  <TableHead className="px-4 py-2 font-semibold text-white">
                    Working Hours
                  </TableHead>
                  <TableHead className="px-4 py-2 font-semibold text-white">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => (
                  <TableRow
                    key={record._id}
                    className="bg-background shadow-lg rounded-lg border-separate"
                  >
                    <TableCell className="px-4">{record.employeeId}</TableCell>
                    <TableCell className="px-4">
                      {record.firstName} {record.surname}
                    </TableCell>
                    <TableCell className="px-4">
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4">
                      {new Date(record.checkInTime).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="px-4">
                      {new Date(record.checkOutTime).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="px-4">
                      {record.totalWorkingHours}
                    </TableCell>
                    <TableCell className="px-4">
                      <Select
                        defaultValue={record.status}
                        onValueChange={(value) => handleStatusChange(record._id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={record.status} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <Pagination>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              <PaginationContent>
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      isActive={currentPage === index + 1}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </>
        )}
      </div>
    </>
  );
};

export default Approvals;
