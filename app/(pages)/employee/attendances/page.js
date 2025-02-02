"use client"
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import Header from "@/components/breadcumb";
import { Calendar, Clock, Activity } from 'lucide-react';
import LoadingSpinner from '@/components/spinner';


const AttendanceHistory = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "001-0001";
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [Name, setName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/users/attendance/${employerId}`);
        const nameResponse = await axios.get(`/api/employees/${employerId}`);
        setData(response.data);
        setName(nameResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [employerId]);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = data.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Approved': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Rejected': 'bg-red-100 text-red-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || statusColors.default;
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header heading="Attendance History" />
      {isLoading ? (
        <LoadingSpinner 
        variant="pulse"
        size="large"
        text="Processing..."
        fullscreen={true}
      />    
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-1 flex-col gap-4 p-4 pt-0"
        >
          <div className="transition-all duration-300 flex-1 p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
            <div className="p-4">
              <motion.div {...fadeInUp} className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Calendar className="w-8 h-8 text-primary" />
                  Attendance History
                </h1>
              </motion.div>

              <div className="overflow-hidden rounded-xl shadow-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary dark:bg-primary-dark">
                      <TableHead className="text-white font-semibold">ID</TableHead>
                      <TableHead className="text-white font-semibold">Name</TableHead>
                      <TableHead className="text-white font-semibold">Date</TableHead>
                      <TableHead className="text-white font-semibold">Time In</TableHead>
                      <TableHead className="text-white font-semibold">Time Out</TableHead>
                      <TableHead className="text-white font-semibold">Break</TableHead>
                      <TableHead className="text-white font-semibold">Hours</TableHead>
                      <TableHead className="text-white font-semibold">Leave</TableHead>
                      <TableHead className="text-white font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((record, index) => (
                      <motion.tr
                        key={record._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <TableCell className="font-medium">{record.employeeId}</TableCell>
                        <TableCell>{Name}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {new Date(record.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="">
                        <div className='flex items-center gap-2'>

                          <Clock className="w-4 h-4 text-green-500" />
                          {new Date(record.checkInTime).toLocaleTimeString()}
                          </div>

                        </TableCell>
                        <TableCell className="">
                        <div className='flex items-center gap-2'>

                          <Clock className="w-4 h-4 text-red-500" />
                          {new Date(record.checkOutTime).toLocaleTimeString()}
                          </div>

                        </TableCell>
                        <TableCell>{record.totalBreakDuration}</TableCell>
                        <TableCell>{record.totalWorkingHours}</TableCell>
                        <TableCell>
                          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            {record.leave || "No Leave"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mt-4"
          >
            <Pagination>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="hover:bg-primary hover:text-white transition-colors"
              />
              <PaginationContent>
                {[...Array(totalPages).keys()].map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page + 1}
                      onClick={() => handlePageChange(page + 1)}
                      className={`${
                        currentPage === page + 1
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      } transition-colors`}
                    >
                      {page + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="hover:bg-primary hover:text-white transition-colors"
              />
            </Pagination>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AttendanceHistory;