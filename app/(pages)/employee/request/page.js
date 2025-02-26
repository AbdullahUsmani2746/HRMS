"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Calendar as CalendarIcon,
  Edit,
  Trash2,
  Plus,
  Search,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import LoadingSpinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/breadcumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "next-auth/react";

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

const RequestForm = ({ type, onClose, existingData, employeeId }) => {
  const [formData, setFormData] = useState({
    type: type,
    employeeId: employeeId,
    employerId: `CLIENT-${employeeId.split("-")[0]}`,
    startDate: existingData?.startDate || null,
    endDate: existingData?.endDate || null,
    reason: existingData?.reason || "",
    leaveType: existingData?.leaveType || "annual",
    checkIn: existingData?.checkIn || "",
    checkOut: existingData?.checkOut || "",
    status: "Pending",
  });

  const leaveTypes = [
    { value: "annual", label: "Annual Leave" },
    { value: "sick", label: "Sick Leave" },
    { value: "emergency", label: "Emergency Leave" },
    { value: "unpaid", label: "Unpaid Leave" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/users/request/${employeeId}`, formData);
      onClose();
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  };

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="bg-foreground border-white/10 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-background">
            {type === "leave" ? "Leave Request" : "Attendance Correction"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <motion.div
              variants={ANIMATION_VARIANTS.item}
              className="space-y-4 p-4 rounded-lg bg-background/5 border border-background/10"
            >
              {type === "leave" && (
                <motion.div variants={ANIMATION_VARIANTS.item}>
                  <label className="text-sm text-background/60">
                    Leave Type
                  </label>
                  <Select
                    value={formData.leaveType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, leaveType: value }))
                    }
                  >
                    <SelectTrigger className="bg-background/5 border-background/10 text-background">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}

              <motion.div variants={ANIMATION_VARIANTS.item}>
                <label className="text-sm text-background/60">
                  {type === "leave" ? "Leave Duration" : "Date"}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start mt-2 bg-background/5 border-background/10 text-background hover:bg-background/10"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate
                        ? type === "leave" && formData.endDate
                          ? `${format(
                            formData.startDate,
                            "MMM dd, yyyy"
                          )} - ${format(formData.endDate, "MMM dd, yyyy")}`
                          : format(formData.startDate, "MMM dd, yyyy")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode={type === "leave" ? "range" : "single"}
                      selected={
                        type === "leave"
                          ? { from: formData.startDate, to: formData.endDate }
                          : formData.startDate
                      }
                      onSelect={(date) => {
                        if (type === "leave") {
                          setFormData((prev) => ({
                            ...prev,
                            startDate: date?.from || null,
                            endDate: date?.to || null,
                          }));
                        } else {
                          setFormData((prev) => ({ ...prev, startDate: date }));
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </motion.div>

              {type === "attendance" && (
                <motion.div
                  variants={ANIMATION_VARIANTS.item}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <label className="text-sm text-background/60">
                      Check In
                    </label>
                    <Input
                      type="time"
                      value={formData.checkIn}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          checkIn: e.target.value,
                        }))
                      }
                      className="mt-2 bg-background/5 border-background/10 text-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-background/60">
                      Check Out
                    </label>
                    <Input
                      type="time"
                      value={formData.checkOut}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          checkOut: e.target.value,
                        }))
                      }
                      className="mt-2 bg-background/5 border-background/10 text-background"
                    />
                  </div>
                </motion.div>
              )}

              <motion.div variants={ANIMATION_VARIANTS.item}>
                <label className="text-sm text-background/60">Reason</label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="Enter your reason here..."
                  className="mt-2 min-h-[100px] bg-background/5 border-background/10 text-background placeholder:text-background/40"
                />
              </motion.div>
            </motion.div>

            <div className="flex justify-end gap-2 pt-4 border-t border-background/10">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-background/10 text-foreground hover:bg-background/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-background text-foreground hover:bg-background/90"
              >
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const RequestManagement = () => {
  const { data: session } = useSession();
  const employeeId = session?.user?.username;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [requestType, setRequestType] = useState("leave");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 5;

  const columns =
    requestType === "leave"
      ? [
        { key: "leaveType", header: "Leave Type" },
        { key: "startDate", header: "Start Date" },
        { key: "endDate", header: "End Date" },
        { key: "reason", header: "Reason" },
        { key: "status", header: "Status" },
      ]
      : [
        { key: "startDate", header: "Date" },
        { key: "checkIn", header: "Check In" },
        { key: "checkOut", header: "Check Out" },
        { key: "reason", header: "Reason" },
        { key: "status", header: "Status" },
      ];

  useEffect(() => {
    fetchRequests();
  }, [requestType, currentPage]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/users/request/${employeeId}?type=${requestType}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const firstKey = columns[0].key;
    if (sortOrder === "asc") {
      return a[firstKey].toString().localeCompare(b[firstKey].toString());
    }
    return b[firstKey].toString().localeCompare(a[firstKey].toString());
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

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
    <div className="min-h-screen bg-background">
      <Header
        heading={
          requestType === "leave" ? "Leave Requests" : "Attendance Requests"
        }
      />
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={ANIMATION_VARIANTS.container}
        initial="hidden"
        animate="visible"
      >
        <Card className="bg-foreground border-white/10 shadow-xl">
          <CardContent className="p-8">
            {/* Header Section */}
            <motion.div
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
              variants={ANIMATION_VARIANTS.item}
            >
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-background tracking-tight">
                  {requestType === "leave"
                    ? "Leave Requests"
                    : "Attendance Requests"}
                </h1>
                <p className="text-background/70">
                  Manage and track all {requestType} requests in one place
                </p>
              </div>

              <div className="flex gap-4">
                <Select
                  value={requestType}
                  onValueChange={setRequestType}
                  className="min-w-[200px]"
                >
                  <SelectTrigger className="bg-background/5 border-background/10 text-background">
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leave">Leave Requests</SelectItem>
                    <SelectItem value="attendance">
                      Attendance Requests
                    </SelectItem>
                  </SelectContent>
                </Select>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => openModal()}
                    className="bg-background text-foreground hover:bg-background/90 transition-all duration-200 shadow-lg hover:shadow-background/20"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    New Request
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Search Section */}
            <motion.div
              className="mb-6 flex flex-col sm:flex-row gap-4"
              variants={ANIMATION_VARIANTS.item}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-4 h-4" />
                <Input
                  placeholder="Search requests..."
                  className="pl-10 bg-background/5 border-background/10 text-background placeholder:text-background/40 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="border-background/10 text-foreground hover:bg-background/5"
              >
                Sort
                <ChevronDown
                  className={`ml-2 h-4 w-4 transform transition-transform ${sortOrder === "desc" ? "rotate-180" : ""
                    }`}
                />
              </Button>
            </motion.div>

            {/* Table Section */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner
                  variant="pulse"
                  size="large"
                  text="Processing..."
                  fullscreen={true}
                />
              </div>
            ) : (
              <motion.div
                variants={ANIMATION_VARIANTS.container}
                className="relative overflow-hidden rounded-lg border border-background/10"
              >
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-background/10 bg-background/5">
                        {columns.map((column) => (
                          <TableHead
                            key={column.key}
                            className="text-background font-medium py-5 px-6"
                          >
                            {column.header}
                          </TableHead>
                        ))}
                        <TableHead className="text-background font-medium py-5 px-6">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {currentData
                          .filter(item => item.type === requestType)
                          .map((item) => (
                            <motion.tr
                              key={item._id}
                              variants={ANIMATION_VARIANTS.item}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              className="border-background/10 hover:bg-background/5 transition-colors"
                            >
                              {columns.map((column) => (
                                <TableCell key={`${item._id}-${column.key}`} className="py-4 px-6 text-background">
                                  {["Date", "Start Date", "End Date"].includes(column.header)
                                    ? format(new Date(item[column.key]), "MMM dd, yyyy")
                                    : item[column.key]}
                                </TableCell>

                              ))}
                              <TableCell className="py-4 px-6">
                                <div className="flex gap-4">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => openModal(item)}
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                    <Edit className="w-5 h-5" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onDelete(item._id)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </motion.button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {sortedData.length > 0 && (
                  <div className="mt-4 py-4 border-t border-background/10">
                    <Pagination>
                      <PaginationContent className="text-background">
                        <PaginationItem>
                          <PaginationPrevious
                            className={`text-background ${currentPage === 1
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
                                className={`text-background ${currentPage === item
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
                            className={`text-background ${currentPage === totalPages
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
            )}

            {/* Empty State */}
            {!isLoading && sortedData.length === 0 && (
              <motion.div
                variants={ANIMATION_VARIANTS.item}
                className="text-center py-12"
              >
                <p className="text-background/40 text-lg">
                  {searchTerm
                    ? "No requests found matching your search"
                    : "No requests added yet"}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <Modal onClose={closeModal}>
              <RequestForm
                type={requestType}
                existingData={selectedData}
                onClose={closeModal}
                employeeId={employeeId}
              />
            </Modal>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RequestManagement;
