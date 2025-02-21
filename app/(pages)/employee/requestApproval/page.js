"use client";

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
    <div className="space-y-6">
      <CardHeader>
        <CardTitle>{request.type === 'leave' ? 'Leave Request Details' : 'Attendance Correction Details'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Employee</label>
              <p className="mt-1">{request.employee.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <p className="mt-1">{request.employee.department}</p>
            </div>
            {request.type === 'leave' ? (
              <>
                <div>
                  <label className="text-sm font-medium">Leave Type</label>
                  <p className="mt-1 capitalize">{request.leaveType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <p className="mt-1">
                    {format(new Date(request.startDate), "MMM dd, yyyy")} - 
                    {format(new Date(request.endDate), "MMM dd, yyyy")}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p className="mt-1">{format(new Date(request.date), "MMM dd, yyyy")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <p className="mt-1">{request.checkIn} - {request.checkOut}</p>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Reason</label>
            <p className="mt-1">{request.reason}</p>
          </div>

          <div>
            <label className="text-sm font-medium">Rejection Reason (Required for rejection)</label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button variant="default" onClick={() => onApprove(request._id)}>
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>
      </CardContent>
    </div>
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

  return (
    <div className="min-h-screen bg-background">
      <Header heading="Request Approvals Dashboard" />
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={ANIMATION_VARIANTS.container}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="leave" className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Leave Requests
                  </TabsTrigger>
                  <TabsTrigger value="attendance" className="flex items-center">
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

              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by employee name..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="leave">
                <RequestsTable
                  requests={requests}
                  columns={columns.leave}
                  isLoading={isLoading}
                  onViewRequest={handleViewRequest}
                  getStatusBadge={getStatusBadge}
                />
              </TabsContent>

              <TabsContent value="attendance">
                <RequestsTable
                  requests={requests}
                  columns={columns.attendance}
                  isLoading={isLoading}
                  onViewRequest={handleViewRequest}
                  getStatusBadge={getStatusBadge}
                />
              </TabsContent>
            </Tabs>

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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const RequestsTable = ({ requests, columns, isLoading, onViewRequest, getStatusBadge }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
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
          {requests.map((request) => (
            <TableRow key={request._id}>
              {columns.map((column) => (
                <TableCell key={`${request._id}-${column.key}`}>
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
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewRequest(request)}
                  className="flex items-center"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RequestApprovalDashboard;