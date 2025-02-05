"use client"
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, Plus, Search, ChevronDown } from "lucide-react";
import SubscriptionProcess from "@/components/subProcess";
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
import axios from 'axios';

// Animation variants for smooth transitions
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

const Subscription = () => {
  // States for subscription data and UI
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch all necessary data on component mount
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subsResponse, detailsResponse, appsResponse] = await Promise.all([
        axios.get("/api/subscriptionPlanMaster"),
        axios.get("/api/subscriptionPlanApplications"),
        axios.get("/api/applications"),
      ]);

      setSubscriptions(subsResponse.data.data);
      setSubscriptionDetails(detailsResponse.data.data);
      setApplications(appsResponse.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Modal handlers
  const openModal = () => {
    setEditMode(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditMode(false);
    setIsModalOpen(false);
    fetchData();
  };

  const openEditModal = (subscription) => {
    setSelectedSubscription(subscription);
    setEditMode(true);
    setIsModalOpen(true);
  };

  // Helper function to get applications for a plan
  const getApplicationsForPlan = (planId) => {
    return subscriptionDetails
      .filter((detail) => detail.planId === planId)
      .map((detail) => {
        const app = applications.find(
          (application) => application._id === detail.applicationId
        );
        return app ? app.applicationName : "";
      });
  };

  // Delete subscription and related data
  const deleteSubscription = async (subscriptionId) => {
    try {
      await Promise.all([
        axios.delete(`/api/subscriptionPlanMaster/${subscriptionId}`),
        axios.delete(`/api/subscriptionPlanApplications/${subscriptionId}`),
        axios.delete(`/api/subscriptionPlanDetail/${subscriptionId}`)
      ]);
      await fetchData();
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  // Search and filter logic
  const filteredSubscriptions = subscriptions.filter(subscription =>
    subscription.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.subscriptionFee.toString().includes(searchTerm)
  );

  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.planName.localeCompare(b.planName);
    }
    return b.planName.localeCompare(a.planName);
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedSubscriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedSubscriptions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
      <Header heading="Subscriptions" />
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
                  Subscription Plans
                </h1>
                <p className="text-background/70">
                  Manage your subscription plans and their associated applications
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={openModal}
                  className="bg-background text-foreground hover:bg-background/90 transition-all duration-200 shadow-lg hover:shadow-background/20"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Subscription
                </Button>
              </motion.div>
            </motion.div>

            {/* Search Section */}
            <motion.div 
              className="mb-6 flex flex-col sm:flex-row gap-4"
              variants={ANIMATION_VARIANTS.item}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-4 h-4" />
                <Input
                  placeholder="Search subscriptions..."
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

            {/* Table Section */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner 
                  variant="pulse"
                  size="large"
                  text="Loading subscriptions..."
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
                          Plan Name
                        </TableHead>
                        <TableHead className="text-background font-medium py-5 px-6">
                          Subscription Fee
                        </TableHead>
                        <TableHead className="text-background font-medium py-5 px-6">
                          Applications
                        </TableHead>
                        <TableHead className="text-background font-medium py-5 px-6">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {currentData.map((subscription) => (
                          <motion.tr
                            key={subscription._id}
                            variants={ANIMATION_VARIANTS.item}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="border-background/10 hover:bg-background/5 transition-colors"
                          >
                            <TableCell className="py-4 px-6 text-background">
                              {subscription.planName}
                            </TableCell>
                            <TableCell className="py-4 px-6 text-background">
                              ${subscription.subscriptionFee}
                            </TableCell>
                            <TableCell className="py-4 px-6 text-background">
                              <ul className="list-disc pl-4">
                                {getApplicationsForPlan(subscription._id).map((appName, index) => (
                                  <li key={index}>{appName}</li>
                                ))}
                              </ul>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="flex gap-4">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => openEditModal(subscription)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  <Edit className="w-5 h-5" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => deleteSubscription(subscription._id)}
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
                {sortedSubscriptions.length > 0 && (
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
            {!isLoading && sortedSubscriptions.length === 0 && (
              <motion.div 
                variants={ANIMATION_VARIANTS.item}
                className="text-center py-12"
              >
                <p className="text-background/40 text-lg">
                  {searchTerm ? "No subscriptions found matching your search" : "No subscriptions added yet"}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <Modal onClose={closeModal}>
              <SubscriptionProcess
                editMode={editMode}
                initialData={editMode ? selectedSubscription : {}}
                onClose={closeModal}
              />
            </Modal>
          )}
        </AnimatePresence>

</motion.div>
</div>
);
};

// Custom hook for managing subscriptions data and operations
const useSubscriptionManager = () => {
const baseUrl = '/api';

const deleteSubscriptionData = async (subscriptionId) => {
try {
await Promise.all([
  axios.delete(`${baseUrl}/subscriptionPlanMaster/${subscriptionId}`),
  axios.delete(`${baseUrl}/subscriptionPlanApplications/${subscriptionId}`),
  axios.delete(`${baseUrl}/subscriptionPlanDetail/${subscriptionId}`)
]);
return true;
} catch (error) {
console.error('Error deleting subscription:', error);
return false;
}
};

const createSubscriptionData = async (subscriptionData) => {
try {
const response = await axios.post(`${baseUrl}/subscriptionPlanMaster`, subscriptionData);
return response.data;
} catch (error) {
console.error('Error creating subscription:', error);
return null;
}
};

const updateSubscriptionData = async (subscriptionId, subscriptionData) => {
try {
const response = await axios.put(`${baseUrl}/subscriptionPlanMaster/${subscriptionId}`, subscriptionData);
return response.data;
} catch (error) {
console.error('Error updating subscription:', error);
return null;
}
};

return {
deleteSubscriptionData,
createSubscriptionData,
updateSubscriptionData
};
};

// Helper function to format currency values
const formatCurrency = (amount) => {
return new Intl.NumberFormat('en-US', {
style: 'currency',
currency: 'USD',
minimumFractionDigits: 2
}).format(amount);
};

// Helper function to validate subscription data
const validateSubscriptionData = (data) => {
const errors = {};

if (!data.planName?.trim()) {
errors.planName = 'Plan name is required';
}

if (!data.subscriptionFee || data.subscriptionFee <= 0) {
errors.subscriptionFee = 'Valid subscription fee is required';
}

if (!data.applications?.length) {
errors.applications = 'At least one application must be selected';
}

return {
isValid: Object.keys(errors).length === 0,
errors
};
};

export default Subscription;