"use client"
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, Eye, EyeOff, Plus, Search, ChevronDown } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableHeader,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PopupForm from "./popupForm";
import { columns as defaultColumns } from "@/components/columns";

// Animation variants matching the first code
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

const EmployerTable = () => {
  const router = useRouter();
  const [employers, setEmployers] = useState([]);
  const [plan, setPlan] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [columns, setColumns] = useState(defaultColumns);
  const [employerToEdit, setEmployerToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchEmployers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/employers");
      setEmployers(response.data.data);
      const responsePlan = await axios.get("/api/subscriptionPlanMaster");
      setPlan(responsePlan.data.data);
    } catch (error) {
      console.error("Error fetching employers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  const filteredEmployers = employers.filter((employer) => {
    if (!employer || !employer.businessName) return false;
    const matchesSearchQuery = employer.businessName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatusFilter =
      statusFilter === "All" || employer.status === statusFilter;
    return matchesSearchQuery && matchesStatusFilter;
  });

  // Sort employers
  const sortedEmployers = [...filteredEmployers].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.businessName.localeCompare(b.businessName);
    }
    return b.businessName.localeCompare(a.businessName);
  });

  const toggleColumn = (columnId) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId ? { ...col, isVisible: !col.isVisible } : col
      )
    );
  };

  const openPopup = (employer = null) => {
    setEmployerToEdit(employer);
    setIsPopupOpen(true);
  };

  const closePopup = async () => {
    setIsPopupOpen(false);
    setEmployerToEdit(null);
    await fetchEmployers();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employer?")) {
      try {
        await axios.delete(`/api/employers/${id}`);
        await fetchEmployers();
      } catch (error) {
        console.error("Error deleting employer:", error);
      }
    }
  };

  
  // Pagination logic
  const totalPages = Math.ceil(sortedEmployers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedEmployers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Generate pagination items with ellipsis
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
                  Client Management
                </h1>
                <p className="text-background/70">
                  Manage your clients and their subscription plans
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => openPopup()}
                  className="bg-background text-foreground hover:bg-background/90 transition-all duration-200 shadow-lg hover:shadow-background/20"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Client
                </Button>
              </motion.div>
            </motion.div>

            {/* Search and Filter Section */}
            <motion.div
              className="mb-6 flex flex-col sm:flex-row gap-4"
              variants={ANIMATION_VARIANTS.item}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-4 h-4" />
                <Input
                  placeholder="Search clients by business name..."
                  className="pl-10 bg-background/5 border-background/10 text-background placeholder:text-background/40 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-background/5 border-background/10 text-background">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Clients</SelectItem>
                  <SelectItem value="ACTIVE">Active Clients</SelectItem>
                  <SelectItem value="INACTIVE">Inactive Clients</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-background/10 text-foreground">
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {columns.map((column) => (
                    <DropdownMenuItem
                      key={column.id}
                      onClick={() => toggleColumn(column.id)}
                    >
                      {column.isVisible ? <Eye className="mr-2" /> : <EyeOff className="mr-2" />}
                      {column.header}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="border-background/10 text-foreground hover:bg-background/5"
              >
                Sort
                <ChevronDown
                  className={`ml-2 h-4 w-4 transform transition-transform ${
                    sortOrder === "desc" ? "rotate-180" : ""
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
                  text="Loading Clients..."
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
                        {columns
                          .filter((col) => col.isVisible)
                          .map((col) => (
                            <TableHead
                              key={col.id}
                              className="text-background font-medium py-5 px-6"
                            >
                              {col.header}
                            </TableHead>
                          ))}
                        <TableHead className="text-background font-medium py-5 px-6">Plan</TableHead>
                        <TableHead className="text-background font-medium py-5 px-6">Fee</TableHead>
                        <TableHead className="text-background font-medium py-5 px-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {currentData.map((employer) => (
                          <motion.tr
                            key={employer._id}
                            variants={ANIMATION_VARIANTS.item}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="border-background/10 hover:bg-background/5 transition-colors"
                          >
                            {columns
                              .filter((col) => col.isVisible)
                              .map((col) => (
                                <TableCell
                                  key={col.id}
                                  className="py-4 px-6 text-background"
                                >
                                  {col.id === "contactPerson"
                                    ? `${employer.cpFirstName || ""} ${employer.cpSurname || ""}`
                                    : employer[col.id]}
                                </TableCell>
                              ))}
                            <TableCell className="py-4 px-6 text-background">
                              {plan
                                .filter((p) => p._id === employer.subscriptionPlan)
                                .map((matchedPlan) => matchedPlan.planName)}
                            </TableCell>
                            <TableCell className="py-4 px-6 text-background">
                              {plan
                                .filter((p) => p._id === employer.subscriptionPlan)
                                .map((matchedPlan) => `$${matchedPlan.subscriptionFee}`)}
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="flex gap-4">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => openPopup(employer)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  <Edit className="w-5 h-5" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete(employer._id)}
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

                {/* Pagination Controls */}
                                {sortedEmployers.length > 0 && (
                                  <div className="mt-4 py-4 border-t border-background/10">
                                    <Pagination>
                                      <PaginationContent className="text-background">
                                        <PaginationItem>
                                          <PaginationPrevious
                                            className={`text-background ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-background/10'}`}
                                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                          />
                                        </PaginationItem>
                                        
                                        {generatePaginationItems().map((item, index) => (
                                          <PaginationItem key={index}>
                                            {item === 'ellipsis' ? (
                                              <PaginationEllipsis className="text-background" />
                                            ) : (
                                              <PaginationLink
                                                className={`text-background ${currentPage === item ? 'bg-background/20' : 'hover:bg-background/10'}`}
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
                                            className={`text-background ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-background/10'}`}
                                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                          />
                                        </PaginationItem>
                                      </PaginationContent>
                                    </Pagination>
                                  </div>
                                )}

                {/* Empty State */}
                {!isLoading && sortedEmployers.length === 0 && (
                  <motion.div
                    variants={ANIMATION_VARIANTS.item}
                    className="text-center py-12"
                  >
                    <p className="text-background/40 text-lg">
                      {searchQuery
                        ? "No clients found matching your search"
                        : "No clients added yet"}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <AnimatePresence>
          {isPopupOpen && (
            <PopupForm
              onClose={closePopup}
              setEmployers={setEmployers}
              employerToEdit={employerToEdit}
            />
          )}
        </AnimatePresence>
      </motion.div>
  );
};

export default EmployerTable;