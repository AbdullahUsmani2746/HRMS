// pages/employers.js
"use client";
import { useSession } from "next-auth/react";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import LoadingSpinner from "@/components/spinner";
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
import { useEffect, useState } from 'react'; 
import axios from 'axios'; 
import { Button } from '@/components/ui/button'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';  // Assuming Pagination components are imported
import Header from "@/components/breadcumb";

const AttendanceHistory = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "001-0001";
  // const employerId = "001-0002";

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [Name, setName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // You can set the page size to any value

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/users/attendance/${employerId}`);
        const nameResponse = await axios.get(`/api/employees/${employerId}`);

        console.log(response)
        setData(response.data);
        setName(nameResponse.data.data)
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [employerId]);

   // Calculate the index range for the current page
   const totalPages = Math.ceil(data.length / pageSize);
   const startIndex = (currentPage - 1) * pageSize;
   const currentData = data.slice(startIndex, startIndex + pageSize);
 
   // Handle page change
   const handlePageChange = (page) => {
     if (page >= 1 && page <= totalPages) {
       setCurrentPage(page);
     }
   };

  return (
    <>
      <Header heading="Attendance History" />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="transition-width duration-300 flex-1 p-6">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl">Attendance History</h1>
              </div>

                <Table className="shadow-md rounded-lg border-separate">
                  <TableHeader>
                    <TableRow className="bg-foreground text-left">
                      <TableHead className="px-4 py-2 font-semibold text-white">ID</TableHead>
                      <TableHead className="px-4 py-2 font-semibold text-white">Name</TableHead>
                      <TableHead className="px-4 py-2 font-semibold text-white">Date</TableHead>
                      <TableHead className="px-4 py-2 font-semibold text-white">Time In</TableHead>
                      <TableHead className="px-4 py-2 font-semibold text-white">Time Out</TableHead>
                      <TableHead className="px-4 py-2 font-semibold text-white">Break Duration</TableHead>
                      <TableHead className="px-4 py-2 font-semibold text-white">Working Hours</TableHead>
                      <TableHead className="px-4 py-2 font-semibold text-white">Leave</TableHead>
                      <TableHead className="px-4 py-2 font-semibold text-white">Approval</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((record) => (
                      <TableRow key={record._id} className="bg-background shadow-lg rounded-lg border-separate">
                        <TableCell className="px-4">{record.employeeId}</TableCell>
                        <TableCell className="px-4">{Name}</TableCell>
                        <TableCell className="px-4">{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell className="px-4">{new Date(record.checkInTime).toLocaleTimeString()}</TableCell>
                        <TableCell className="px-4">{new Date(record.checkOutTime).toLocaleTimeString()}</TableCell>
                        <TableCell className="px-4">{record.totalBreakDuration}</TableCell>
                        <TableCell className="px-4">{record.totalWorkingHours}</TableCell>
                        <TableCell className="px-4">{record.leave || "No Leave"}</TableCell>
                        <TableCell className="px-4">{record.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </div>
          </div>

           {/* Pagination controls */}
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
    </>
  );
};

export default AttendanceHistory;
