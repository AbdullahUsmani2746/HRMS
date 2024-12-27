"use client";
import { useSession } from "next-auth/react";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/spinner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
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
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"; // Assuming Pagination components are imported

import { Input } from "@/components/ui/input"; // Import ShadCN Input component

const Approvals = () => {
  const { data: session } = useSession();
  const employeeId = "001-0001"; // Replace with dynamic session or hardcoded ID for testing

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [Name, setName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Adding search functionality state
  const [searchEmployeeId, setSearchEmployeeId] = useState(""); // For Employee ID search
  const [searchDate, setSearchDate] = useState(""); // For Date search

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
        const ManagerResposnse = await axios.get(
          `/api/employees/manager/specificID?employeeId=${employeeId}`
        );
        const { _id } = ManagerResposnse.data.data[0];

        // Fetch employees under the manager's department
        const employeeResponse = await axios.get(
          `/api/employees?managerId=${_id}`
        );

        // Fetch attendance for each employee
        const employeeAttendancePromises = employeeResponse.data.data.map(
          async (employee) => {
            const attendanceResponse = await axios.get(
              `/api/users/attendance/${employee.employeeId}`
            );
            return {
              ...employee,
              attendance: attendanceResponse.data,
            };
          }
        );

        // Wait for all employee attendance requests to resolve
        const employeesWithAttendance = await Promise.all(
          employeeAttendancePromises
        );

        setData(employeeResponse.data.data);
        setAttendanceData(employeesWithAttendance); // Set attendance data
        setName("Manager Name"); // Example, use actual data if needed
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  // Pagination logic
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = data.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Helper function to compare the date in YYYY-MM-DD format
  const formatDate = (dateString) => {
    // Split the input date string by '/' to extract month, day, and year
  const [month, day, year] = dateString.split("/");

  // Return the date in YYYY-MM-DD format
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Filter by Employee ID and Date
  const filteredData = currentData.filter((employee, index) => {
    let matchesEmployeeId = true;
    let matchesDate = true;

    if (searchEmployeeId) {
      matchesEmployeeId = employee.employeeId.toLowerCase().includes(searchEmployeeId.toLowerCase());
    }

    if (searchDate) {
      // Fixing undefined check for employee.attendance
      matchesDate = attendanceData[index]?.attendance?.some((record) =>
        formatDate(new Date(record.date).toLocaleDateString()) === searchDate
      );
    }

    return matchesEmployeeId && matchesDate;
  });

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">HR Management Software</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Attendance</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="p-4">
          <h1 className="text-2xl mb-4">Attendance History</h1>

          {/* Add Search Inputs for Employee ID and Date using ShadCN components */}
          <div className="mb-4 flex gap-4">
            <div>
              <Input
                type="text"
                placeholder="Search by Employee ID"
                value={searchEmployeeId}
                onChange={(e) => setSearchEmployeeId(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
          </div>

          <Table className="shadow-md rounded-lg border-separate">
            <TableHeader>
              <TableRow className="bg-foreground text-left">
                <TableHead className="px-4 py-2 font-semibold text-white">
                  ID
                </TableHead>
                <TableHead className="px-4 py-2 font-semibold text-white">
                  Name
                </TableHead>
               <TableHead className="px-4 py-2 font-semibold text-white" >
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
               </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((employee, index) => (
                <TableRow
                  key={employee._id}
                  className="bg-background shadow-lg rounded-lg border-separate"
                >
                  <TableCell className="px-4">{employee.employeeId}</TableCell>
                  <TableCell className="px-4" >
                    {employee.firstName} {employee.surname}
                  </TableCell>
                  {attendanceData[index]?.attendance.map((record) => (
                     <TableRow
                       key={`${employee.employeeId}-${record._id}`}
                       className="bg-background shadow-lg rounded-lg border-separate"
                     >
                      <TableCell className="px-4">
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4">
                        {new Date(record.checkInTime).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="px-4">
                        {new Date(record.checkOutTime).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="px-4">{record.totalWorkingHours}</TableCell>
                      <TableCell className="px-4">
                        <Select
                          onValueChange={(value) => handleStatusChange(record._id, value)}
                          defaultValue={record.status}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={record.status} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                     </TableRow>
                  ))}
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
              {[...Array(totalPages).keys()].map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page + 1}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
    </SidebarInset>
  );
};

export default Approvals;
