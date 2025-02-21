"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, FileText, Plus, Search, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import axios from 'axios';
import LoadingSpinner from "@/components/spinner";
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from "@/components/breadcumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  }
};

const RequestForm = ({ type, onClose, existingData }) => {
  const [formData, setFormData] = useState({
    type: type,
    startDate: existingData?.startDate || null,
    endDate: existingData?.endDate || null,
    reason: existingData?.reason || '',
    leaveType: existingData?.leaveType || 'annual',
    checkIn: existingData?.checkIn || '',
    checkOut: existingData?.checkOut || '',
    status: 'Pending'
  });

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'emergency', label: 'Emergency Leave' },
    { value: 'unpaid', label: 'Unpaid Leave' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/requests', formData);
      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CardHeader>
        <CardTitle>{type === 'leave' ? 'Leave Request' : 'Attendance Correction'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {type === 'leave' && (
            <div>
              <label className="block text-sm font-medium mb-2">Leave Type</label>
              <Select 
                value={formData.leaveType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, leaveType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              {type === 'leave' ? 'Leave Duration' : 'Date'}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? (
                    type === 'leave' && formData.endDate ? 
                    `${format(formData.startDate, "MMM dd, yyyy")} - ${format(formData.endDate, "MMM dd, yyyy")}` :
                    format(formData.startDate, "MMM dd, yyyy")
                  ) : (
                    "Select date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode={type === 'leave' ? "range" : "single"}
                  selected={type === 'leave' ? { from: formData.startDate, to: formData.endDate } : formData.startDate}
                  onSelect={(date) => {
                    if (type === 'leave') {
                      setFormData(prev => ({
                        ...prev,
                        startDate: date?.from || null,
                        endDate: date?.to || null
                      }));
                    } else {
                      setFormData(prev => ({ ...prev, startDate: date }));
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {type === 'attendance' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Check In</label>
                <Input
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Check Out</label>
                <Input
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Enter your reason here..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Request
            </Button>
          </div>
        </div>
      </CardContent>
    </form>
  );
};

const RequestManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [requestType, setRequestType] = useState('leave');
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const columns = requestType === 'leave' ? [
    { key: 'leaveType', header: 'Leave Type' },
    { key: 'startDate', header: 'Start Date' },
    { key: 'endDate', header: 'End Date' },
    { key: 'reason', header: 'Reason' },
    { key: 'status', header: 'Status' }
  ] : [
    { key: 'date', header: 'Date' },
    { key: 'checkIn', header: 'Check In' },
    { key: 'checkOut', header: 'Check Out' },
    { key: 'reason', header: 'Reason' },
    { key: 'status', header: 'Status' }
  ];

  useEffect(() => {
    fetchRequests();
  }, [requestType, currentPage]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/requests?type=${requestType}&page=${currentPage}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openModal = (data = null) => {
    setSelectedData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedData(null);
    fetchRequests();
  };

  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const totalPages = Math.ceil(data.length / 10);
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) items.push(i);
        items.push('ellipsis');
        items.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        items.push(1);
        items.push('ellipsis');
        for (let i = totalPages - 2; i <= totalPages; i++) items.push(i);
      } else {
        items.push(1);
        items.push('ellipsis');
        items.push(currentPage - 1);
        items.push(currentPage);
        items.push(currentPage + 1);
        items.push('ellipsis');
        items.push(totalPages);
      }
    }
    return items;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header heading={requestType === 'leave' ? 'Leave Requests' : 'Attendance Requests'} />
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={ANIMATION_VARIANTS.container}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leave">Leave Requests</SelectItem>
                  <SelectItem value="attendance">Attendance Requests</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => openModal()} className="ml-4">
                <Plus className="w-5 h-5 mr-2" />
                New Request
              </Button>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search requests..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                Sort
                <ChevronDown className={`ml-2 h-4 w-4 transform transition-transform ${
                  sortOrder === "desc" ? "rotate-180" : ""
                }`} />
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead key={column.key}>{column.header}</TableHead>
                      ))}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item._id}>
                        {columns.map((column) => (
                          <TableCell key={`${item._id}-${column.key}`}>
                            {item[column.key]}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button variant="ghost" onClick={() => openModal(item)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {data.length > 0 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    </PaginationItem>
                    {generatePaginationItems().map((item, index) => (
                      <PaginationItem key={index}>
                        {item === 'ellipsis' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => handlePageChange(item)}
                            isActive={currentPage === item}
                          >
                            {item}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === Math.ceil(data.length / 10)} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        <AnimatePresence>
          {isModalOpen && (
            <Modal onClose={closeModal}>
              <RequestForm
                type={requestType}
                existingData={selectedData}
                onClose={closeModal}
              />
            </Modal>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RequestManagement;