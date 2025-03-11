"use client"
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, Plus, Search, ChevronDown, MessageSquare } from "lucide-react";
import LoadingSpinner from "@/components/spinner";
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from "@/components/breadcumb";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
import HelpdeskModal from './Helpdesk/HelpdeskModal';

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

const onFetch = async (apiEndpoint, employerId, setData, setIsLoading, Helpdesk) => {
  setIsLoading(true);
  try {
    const response = await axios.get(`${apiEndpoint}${Helpdesk ? `?employeeId=${employerId}` : `?employerId=${employerId}`}`);

    setData(response.data.data);



  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setIsLoading(false);
  }


};

const DataManagementPage = ({
  // Page Configuration
  pageTitle,
  pageDescription,
  addButtonText,
  Helpdesk,

  // Data Configuration
  columns,
  searchKeys = [], // Array of keys to search in

  // Component to render in modal
  FormComponent,

  // API Functions
  apiEndpoint,
  employerId,
  // onFetch,
  // onDelete,

  // Optional configurations
  itemsPerPage = 5,
  onStatusUpdate
}) => {
  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [helpdeskViewModal, setHelpdeskViewModal] = useState(false)

  useEffect(() => {
    onFetch(apiEndpoint, employerId, setData, setIsLoading, Helpdesk);
  }, [apiEndpoint, employerId]);

  const onDelete = async (id) => {
    try {
      await axios.delete(`${apiEndpoint}/${id}`);
      await onFetch(apiEndpoint, employerId, setData, setIsLoading);
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  // Modal handlers
  const openModal = (data = null, condition = false) => {

    setSelectedData(data);

    console.log(data)

    if (condition) {
      setHelpdeskViewModal(true);
    }
    else {
      setIsModalOpen(true);

    }
  };


  const closeModal = async () => {
    setIsModalOpen(false);
    setHelpdeskViewModal(false);

    setSelectedData(null);
    await onFetch(apiEndpoint, employerId, setData, setIsLoading, Helpdesk = true);
  };

  // Search and filter logic
  const filteredData = data.filter(item =>
    searchKeys.some(key =>
      item[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const firstKey = columns[0].key;
    if (sortOrder === "asc") {
      return a[firstKey].toString().localeCompare(b[firstKey].toString());
    }
    return b[firstKey].toString().localeCompare(a[firstKey].toString());
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

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
      {pageTitle !== "Help Desk" && <Header heading={pageTitle} />}
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
                  {pageTitle}
                </h1>
                <p className="text-background/70">
                  {pageDescription}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >

                {addButtonText === "" ? "" : (

                  <Button
                    onClick={() => openModal()}
                    className="bg-background text-foreground hover:bg-background/90 transition-all duration-200 shadow-lg hover:shadow-background/20"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {addButtonText}
                  </Button>
                )}

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
                  placeholder={`Search ${pageTitle.toLowerCase()}...`}
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
                />              </div>
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
                        {currentData.map((item) => (
                          <motion.tr
                            key={item._id}
                            variants={ANIMATION_VARIANTS.item}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="border-background/10 hover:bg-background/5 transition-colors"
                          >
                            {columns.map((column) => (
                              column.header === "Status" ? (
                                <TableCell
                                  key={column.key}
                                  className="py-4 px-6 text-background"
                                >
                                  <Badge
                                    key={column.key}
                                    className={`text-white px-2 py-1 ${item[column.key] === "In Progress" ? "bg-[#F5A623]" :
                                      item[column.key] === "open" ? "bg-green-500" :
                                        item[column.key] === "Closed" ? "bg-[#D0021B]" : " "
                                      }`}
                                  >
                                    {item[column.key] === "In Progress" ? "Open" : item[column.key]}
                                  </Badge>
                                </TableCell>
                              ) : (
                                <TableCell
                                  key={column.key}
                                  className="py-4 px-6 text-background"
                                >
                                  {column.key2 ? item[column.key][column.key2] : item[column.key]}
                                </TableCell>
                              )
                            ))}
                            <TableCell className="py-4 px-6">
                              <div className="flex gap-4">
                                {Helpdesk ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openModal(item, true)}

                                    className="flex items-center text-foreground hover:bg-background/10"
                                  >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                ) : (
                                  <>
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
                                  </>
                                )}


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
            {!isLoading && sortedData.length === 0 && (
              <motion.div
                variants={ANIMATION_VARIANTS.item}
                className="text-center py-12"
              >
                <p className="text-background/40 text-lg">
                  {searchTerm ? `No ${pageTitle.toLowerCase()} found matching your search` : `No ${pageTitle.toLowerCase()} added yet`}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <Modal onClose={closeModal}>
              <FormComponent
                existingData={selectedData}
                onClose={closeModal}
              />
            </Modal>
          )}

          {
            helpdeskViewModal && (
              <Modal onClose={closeModal}>
                <HelpdeskModal
                  complaint={selectedData}
                  onClose={closeModal}
                  onStatusUpdate={onStatusUpdate}
                />
              </Modal>
            )
          }
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DataManagementPage;