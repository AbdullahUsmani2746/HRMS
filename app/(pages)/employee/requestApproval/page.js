"use client"

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, MessageSquare, CalendarDays, Clock, Search, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import axios from 'axios';
import LoadingSpinner from "@/components/spinner";
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from "@/components/breadcumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";

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

const RequestApprovalModal = ({ request, onClose, onApprove, onReject }) => {
  const [rejectReason, setRejectReason] = useState('');
  const { toast } = useToast();

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }
    onReject(request._id, rejectReason);
  };

  return (
    <motion.div variants={ANIMATION_VARIANTS.container} initial="hidden" animate="visible" exit="exit" className="w-full max-w-2xl mx-auto">
      <Card className="bg-foreground border-white/10 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-background">
            {request.type === 'leave' ? 'Leave Request Details' : 'Attendance Correction Details'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-6">
            <div className="space-y-4 p-4 rounded-lg bg-background/5 border border-background/10">
              <div className="grid grid-cols-2 gap-4">
                <motion.div variants={ANIMATION_VARIANTS.item}>
                  <label className="text-sm text-background/60">Employee</label>
                  <p className="mt-1 text-background">{request.employee.name}</p>
                </motion.div>
                <motion.div variants={ANIMATION_VARIANTS.item}>
                  <label className="text-sm text-background/60">Department</label>
                  <p className="mt-1 text-background">{request.employee.department}</p>
                </motion.div>
                {request.type === 'leave' ? (
                  <>
                    <motion.div variants={ANIMATION_VARIANTS.item}>
                      <label className="text-sm text-background/60">Leave Type</label>
                      <p className="mt-1 capitalize text-background">{request.leaveType}</p>
                    </motion.div>
                    <motion.div variants={ANIMATION_VARIANTS.item}>
                      <label className="text-sm text-background/60">Duration</label>
                      <p className="mt-1 text-background">
                        {format(new Date(request.startDate), "MMM dd, yyyy")} - 
                        {format(new Date(request.endDate), "MMM dd, yyyy")}
                      </p>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div variants={ANIMATION_VARIANTS.item}>
                      <label className="text-sm text-background/60">Date</label>
                      <p className="mt-1 text-background">
                        {format(new Date(request.date), "MMM dd, yyyy")}
                      </p>
                    </motion.div>
                    <motion.div variants={ANIMATION_VARIANTS.item}>
                      <label className="text-sm text-background/60">Time</label>
                      <p className="mt-1 text-background">{request.checkIn} - {request.checkOut}</p>
                    </motion.div>
                  </>
                )}
              </div>
              <motion.div variants={ANIMATION_VARIANTS.item}>
                <label className="text-sm text-background/60">Reason</label>
                <p className="mt-1 text-background">{request.reason}</p>
              </motion.div>
              <motion.div variants={ANIMATION_VARIANTS.item}>
                <label className="text-sm text-background/60">Rejection Reason (Required for rejection)</label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="mt-1 bg-background/5 border-background/10 text-background placeholder:text-background/40"
                />
              </motion.div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-background/10">
              <Button variant="outline" onClick={onClose} className="border-background/10 text-foreground hover:bg-background/5">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} className="bg-red-500 hover:bg-red-600 text-white">
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button onClick={() => onApprove(request._id)} className="bg-background text-foreground hover:bg-background/90">
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const RequestApprovalDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("leave");
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("pending");
  const itemsPerPage = 5;

  const columns = {
    leave: [
      { key: "employee.name", header: "Employee" },
      { key: "leaveType", header: "Leave Type" },
      { key: "startDate", header: "Start Date" },
      { key: "endDate", header: "End Date" },
      { key: "status", header: "Status" }
    ],
    attendance: [
      { key: "employee.name", header: "Employee" },
      { key: "date", header: "Date" },
      { key: "checkIn", header: "Check In" },
      { key: "checkOut", header: "Check Out" },
      { key: "status", header: "Status" }
    ]
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab, currentPage, filterStatus]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/manager/requests', {
        params: {
          type: activeTab,
          page: currentPage,
          status: filterStatus
        }
      });
      setRequests(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.patch(`/api/manager/requests/${requestId}/approve`);
      toast({
        title: "Success",
        description: "Request approved successfully",
      });
      fetchRequests();
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId, reason) => {
    try {
      await axios.patch(`/api/manager/requests/${requestId}/reject`, { reason });
      toast({
        title: "Success",
        description: "Request rejected successfully",
      });
      fetchRequests();
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return <Badge className={variants[status.toLowerCase()]}>{status}</Badge>;
  };

  const generatePaginationItems = () => {
    const totalPages = Math.ceil(requests.length / itemsPerPage);
    const items = [];
    const maxVisiblePages = 5;
    
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
      <Header heading="Request Approvals Dashboard" />
      <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" variants={ANIMATION_VARIANTS.container} initial="hidden" animate="visible">

        <Card className="bg-foreground border-white/10 shadow-xl">
          <CardContent className="p-8">
                   
      <div className="space-y-2 ml-6 mb-6">
                <h1 className="text-4xl font-bold text-background tracking-tight">
                  {activeTab === 'leave' ? 'Leave Requests' : 'Attendance Requests'}
                </h1>
                <p className="text-background/70">
                  Manage and track all {activeTab} requests in one place
                </p>
              </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-6">
                <TabsList className="p-6 bg-foreground ">
                  <TabsTrigger value="leave" className="flex items-center bg-foreground text-background mr-2 p-2">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Leave Requests
                  </TabsTrigger>
                  <TabsTrigger value="attendance" className="flex items-center bg-foreground text-background p-2">
                    <Clock className="w-4 h-4 mr-2" />
                    Attendance Requests
                  </TabsTrigger>
                </TabsList>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <motion.div className="mb-6 flex flex-col sm:flex-row gap-4" variants={ANIMATION_VARIANTS.item}>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-4 h-4" />
                  <Input
                    placeholder="Search by employee name..."
                    className="pl-10 bg-background/5 border-background/10 text-background placeholder:text-background/40 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="border-background/10 text-foreground hover:bg-background/5"
                >
                  Sort
                  <ChevronDown className={`ml-2 h-4 w-4 transform transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                </Button>
              </motion.div>
              <motion.div variants={ANIMATION_VARIANTS.container} className="relative overflow-hidden rounded-lg border border-background/10">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-background/10 bg-background/5">
                          {columns[activeTab].map((column) => (
                            <TableHead key={column.key} className="text-background font-medium py-5 px-6">
                              {column.header}
                            </TableHead>
                          ))}
                          <TableHead className="text-background font-medium py-5 px-6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
{requests.map((request) => (
                            <motion.tr
                              key={request._id}
                              variants={ANIMATION_VARIANTS.item}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              className="border-background/10 hover:bg-background/5 transition-colors"
                            >
                              {columns[activeTab].map((column) => (
                                <TableCell key={`${request._id}-${column.key}`} className="py-4 px-6 text-background">
                                  {column.key === 'status' ? (
                                    getStatusBadge(request.status)
                                  ) : column.key.includes('.') ? (
                                    column.key.split('.').reduce((obj, key) => obj[key], request)
                                  ) : (
                                    column.key === 'startDate' || column.key === 'endDate' || column.key === 'date' ? 
                                    format(new Date(request[column.key]), "MMM dd, yyyy") :
                                    request[column.key]
                                  )}
                                </TableCell>
                              ))}
                              <TableCell className="py-4 px-6">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewRequest(request)}
                                  className="flex items-center text-background hover:bg-background/10"
                                >
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                    {requests.length > 0 && (
                      <div className="mt-4 py-4 border-t border-background/10">
                        <Pagination>
                          <PaginationContent className="text-background">
                            <PaginationItem>
                              <PaginationPrevious
                                className={`text-background ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-background/10'}`}
                                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                              />
                            </PaginationItem>
                            {generatePaginationItems().map((item, index) => (
                              <PaginationItem key={index}>
                                {item === 'ellipsis' ? (
                                  <PaginationEllipsis className="text-background" />
                                ) : (
                                  <PaginationLink
                                    className={`text-background ${currentPage === item ? 'bg-background/20' : 'hover:bg-background/10'}`}
                                    onClick={() => setCurrentPage(item)}
                                    isActive={currentPage === item}
                                  >
                                    {item}
                                  </PaginationLink>
                                )}
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext
                                className={`text-background ${currentPage === Math.ceil(requests.length / itemsPerPage) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-background/10'}`}
                                onClick={() => currentPage < Math.ceil(requests.length / itemsPerPage) && setCurrentPage(currentPage + 1)}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                    {requests.length === 0 && (
                      <motion.div variants={ANIMATION_VARIANTS.item} className="text-center py-12">
                        <p className="text-background/40 text-lg">
                          {searchTerm ? "No requests found matching your search" : "No requests found"}
                        </p>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            </Tabs>
          </CardContent>
        </Card>
        <AnimatePresence>
          {isModalOpen && (
            <Modal onClose={() => setIsModalOpen(false)}>
              <RequestApprovalModal
                request={selectedRequest}
                onClose={() => setIsModalOpen(false)}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </Modal>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RequestApprovalDashboard;