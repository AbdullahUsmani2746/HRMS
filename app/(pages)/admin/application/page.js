"use client"
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, Plus, Search, ChevronDown } from "lucide-react";
import LoadingSpinner from "@/components/spinner";
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from "@/components/breadcumb";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Applications from "@/components/application";
import axios from 'axios';

// Animation configuration for smooth transitions
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

const Application = () => {
  // Core application states
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Enhanced UI states for search, sort, and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 5;

     

  // Fetch applications data with loading state
  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/applications');
        setApplications(response.data.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  // Modal handling functions
  const openModal = (application = null) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const closeModal = async () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
    const response = await axios.get('/api/applications');
    setApplications(response.data.data);
  };

  // Application deletion with cascading cleanup
  const handleDelete = async (applicationId) => {
    try {
      await Promise.all([
        axios.delete(`/api/applications/${applicationId}`),
        axios.delete(`/api/subscriptionPlanApplications/${applicationId}`),
        axios.delete(`/api/subscriptionPlanDetail/${applicationId}`)
      ]);
      setApplications(applications.filter(app => app._id !== applicationId));
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  // Search and filter logic
  const filteredApplications = applications.filter(app =>
    app.applicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sorting logic
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.applicationName.localeCompare(b.applicationName);
    }
    return b.applicationName.localeCompare(a.applicationName);
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedApplications.slice(startIndex, endIndex);

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
    <div className="min-h-screen bg-background">
      <Header heading="Applications" />
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={ANIMATION_VARIANTS.container}
        initial="hidden"
        animate="visible"
      >
        <Card className="bg-foreground border-white/10 shadow-xl">
          <CardContent className="p-8">
            {/* Header Section with Title and Add Button */}
            <motion.div 
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
              variants={ANIMATION_VARIANTS.item}
            >
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-background tracking-tight">
                  Applications
                </h1>
                <p className="text-background/70">
                  Manage your application and their details
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => openModal()}
                  className="bg-background text-foreground hover:bg-background/90 transition-all duration-200 shadow-lg hover:shadow-background/20"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Application
                </Button>
              </motion.div>
            </motion.div>

            {/* Search and Sort Controls */}
            <motion.div 
              className="mb-6 flex flex-col sm:flex-row gap-4"
              variants={ANIMATION_VARIANTS.item}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-4 h-4" />
                <Input
                  placeholder="Search applications..."
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
                <ChevronDown 
                  className={`ml-2 h-4 w-4 transform transition-transform ${
                    sortOrder === "desc" ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </motion.div>

            {/* Main Content Area with Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner 
                  variant="pulse"
                  size="large"
                  text="Loading applications..."
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
                        <TableHead className="text-background font-medium py-5 px-6">
                          Application Name
                        </TableHead>
                        <TableHead className="text-background font-medium py-5 px-6">
                          Details
                        </TableHead>
                        <TableHead className="text-background font-medium py-5 px-6">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {currentData.map((application) => (
                          <motion.tr
                            key={application._id}
                            variants={ANIMATION_VARIANTS.item}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="border-background/10 hover:bg-background/5 transition-colors"
                          >
                            <TableCell className="py-4 px-6 text-background">
                              {application.applicationName}
                            </TableCell>
                            <TableCell className="py-4 px-6 text-background">
                              {application.details}
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="flex gap-4">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => openModal(application)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  <Edit className="w-5 h-5" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete(application._id)}
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
                {sortedApplications.length > 0 && (
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
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && sortedApplications.length === 0 && (
              <motion.div 
                variants={ANIMATION_VARIANTS.item}
                className="text-center py-12"
              >
                <p className="text-background/40 text-lg">
                  {searchTerm ? "No applications found matching your search" : "No applications added yet"}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Modal for Add/Edit */}
        <AnimatePresence>
          {isModalOpen && (
            <Modal onClose={closeModal}>
              <Applications
                application={selectedApplication}
                onClose={closeModal}
              />
            </Modal>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Application;