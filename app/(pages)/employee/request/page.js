"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  FileText, 
  Send, 
  ClipboardList, 
  MoreVertical 
} from "lucide-react";

import { format, parseISO } from "date-fns";
import { useSession } from "next-auth/react";
import axios from "axios";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast"
// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusVariants = {
    "Pending": "bg-yellow-100 text-yellow-800",
    "Approved": "bg-green-100 text-green-800",
    "Rejected": "bg-red-100 text-red-800"
  };

  return (
    <Badge 
      className={`${statusVariants[status]} 
      px-2 py-1 rounded-full text-xs font-medium`}
    >
      {status}
    </Badge>
  );
};

// Request Form Component
const RequestForm = ({ type, onSubmit, employeeId }) => {
    const { toast } = useToast()
  const [requestData, setRequestData] = useState({
    employeeId,
    type,
    startDate: null,
    endDate: null,
    reason: "",
    status: "Pending"
  });

  const handleSubmit = async () => {
    // Validation
    if (!requestData.startDate || !requestData.reason.trim()) {
        toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSubmit(requestData);
      
      // Reset form
      setRequestData({
        ...requestData,
        startDate: null,
        endDate: null,
        reason: ""
      });

      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} request submitted successfully`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="capitalize">
          {type} Request Form
        </CardTitle>
        <CardDescription>
          Submit your {type} request with detailed information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Date Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {type === 'leave' ? 'Leave Date Range' : 'Missed Attendance Date'}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {requestData.startDate ? (
                      requestData.endDate ? (
                        `${format(requestData.startDate, "LLL dd, y")} - ${format(requestData.endDate, "LLL dd, y")}`
                      ) : (
                        format(requestData.startDate, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode={type === 'leave' ? "range" : "single"}
                    selected={type === 'leave' ? requestData : requestData.startDate}
                    onSelect={(date) => setRequestData(prev => ({
                      ...prev,
                      ...(type === 'leave' 
                        ? { startDate: date?.from, endDate: date?.to }
                        : { startDate: date }
                      )
                    }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {type === 'attendance' && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Attendance Request Type
                </label>
                <Select 
                  onValueChange={(value) => setRequestData(prev => ({
                    ...prev,
                    requestType: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Request Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forgot_punch">Forgot to Punch</SelectItem>
                    <SelectItem value="incorrect_hours">Incorrect Hours</SelectItem>
                    <SelectItem value="system_error">System Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Reason Textarea */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Reason
            </label>
            <Textarea
              placeholder={`Enter reason for ${type === 'leave' ? 'leave' : 'attendance correction'}`}
              value={requestData.reason}
              onChange={(e) => setRequestData(prev => ({
                ...prev,
                reason: e.target.value
              }))}
              className="min-h-[120px]"
            />
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            variant="primary"
          >
            <Send className="mr-2 h-4 w-4" /> Submit Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Requests List Component
const RequestsList = ({ 
  requests, 
  pagination, 
  onPageChange,
  onRequestAction 
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>My Requests</CardTitle>
            <CardDescription>
              View and manage your recent requests
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="mx-auto mb-4 h-12 w-12 text-primary/50" />
            <p>No requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div 
                key={request.id} 
                className="border rounded-lg p-4 flex justify-between items-center hover:bg-muted/30 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold capitalize">
                      {request.type} Request
                    </h3>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">
                    {format(parseISO(request.startDate?.toISOString() || ''), 'PP')}
                    {request.endDate && ` - ${format(parseISO(request.endDate.toISOString() || ''), 'PP')}`}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem 
                      onSelect={() => onRequestAction?.(request.id || '', 'view')}
                    >
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onSelect={() => onRequestAction?.(request.id || '', 'delete')}
                      className="text-destructive focus:text-destructive"
                    >
                      Delete Request
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => onPageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  />
                </PaginationItem>
                {[...Array(pagination.totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => onPageChange(index + 1)}
                      isActive={pagination.currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => onPageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Requests Page Component
const RequestsPage = () => {
    const { toast } = useToast()
  const { data: session } = useSession();
  const employeeId = session?.user?.username || "default-employee";

  const [activeTab, setActiveTab] = useState('leave');
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 5
  });

  // Fetch Requests
  const fetchRequests = useCallback(async (page = 1) => {
    try {
      const response = await axios.get('/api/requests', {
        params: {
          employeeId,
          type: activeTab,
          page,
          pageSize: pagination.pageSize
        }
      });

      setRequests(response.data.requests);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages,
        currentPage: page
      }));
    } catch (error) {
      toast({
        title: "Fetch Error",
        description: "Failed to load requests",
        variant: "destructive"
      });
    }
  }, [activeTab, employeeId, pagination.pageSize]);

  // Submit Request
  const handleSubmitRequest = async (requestData) => {
    try {
      await axios.post('/api/requests', requestData);
      await fetchRequests(pagination.currentPage);
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Failed to submit request",
        variant: "destructive"
      });
    }
  };

  // Request Actions
  const handleRequestAction = async (id, action) => {
    if (action === 'delete') {
      try {
        await axios.delete(`/api/requests/${id}`);
        await fetchRequests(pagination.currentPage);
        toast({
          title: "Request Deleted",
          description: "Your request has been successfully deleted",
        });
      } catch (error) {
        toast({
          title: "Delete Error",
          description: "Failed to delete request",
          variant: "destructive"
        });
      }
    }
  };

  // Fetch requests when tab or page changes
  useEffect(() => {
    fetchRequests();
  }, [activeTab, fetchRequests]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Employee Requests
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Submit and manage your leave and attendance requests
          </p>
        </div>

        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leave">
              <ClipboardList className="mr-2 h-4 w-4" /> Leave Requests
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <FileText className="mr-2 h-4 w-4" /> Attendance Requests
            </TabsTrigger>
          </TabsList>

          {/* Request Form Tab Content */}
          <TabsContent value="leave" className="mt-6">
            <RequestForm 
              type="leave" 
              onSubmit={handleSubmitRequest} 
              employeeId={employeeId} 
            />
          </TabsContent>
          <TabsContent value="attendance" className="mt-6">
            <RequestForm 
              type="attendance" 
              onSubmit={handleSubmitRequest} 
              employeeId={employeeId} 
            />
          </TabsContent>
        </Tabs>

        {/* Requests List */}

        {/* Requests List */}
        <RequestsList 
          requests={requests}
          pagination={pagination}
          onPageChange={fetchRequests}
          onRequestAction={handleRequestAction}
        />
      </div>
    </div>
  );
};

export default RequestsPage;