// "use client"
// import React, { useEffect, useState } from 'react';
// import { useSession } from "next-auth/react";
// import { motion, AnimatePresence } from "framer-motion";
// import Component from "@/components/Employee/Allownces";
// import { Edit, Trash2, Plus, Search, ChevronDown } from "lucide-react";
// import LoadingSpinner from "@/components/spinner";
// import { Button } from '@/components/ui/button';
// import Modal from '@/components/Modal';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import Header from "@/components/breadcumb";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";
// import axios from 'axios';

// const AllowancesPage = () => {
//   const { data: session } = useSession();
//   const employerId = session?.user?.username;
//   const [isLoading, setIsLoading] = useState(false);
//   const [data, setData] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedData, setSelectedData] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortOrder, setSortOrder] = useState("asc");
  
//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   useEffect(() => {
//     fetchData();
//   }, [employerId]);

//   const fetchData = async () => {
//     setIsLoading(true);
//     try {
//       const response = await axios.get(`/api/employees/allownce?employerId=${employerId}`);
//       setData(response.data.data);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const openModal = (data = null) => {
//     setSelectedData(data);
//     setIsModalOpen(true);
//   };

//   const closeModal = async () => {
//     setIsModalOpen(false);
//     setSelectedData(null);
//     await fetchData();
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`/api/employees/allownce/${id}`);
//       setData(data.filter(item => item._id !== id));
//     } catch (error) {
//       console.error('Error deleting data:', error);
//     }
//   };

//   const filteredData = data.filter(item =>
//     item.allownce.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.allownce_description.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const sortedData = [...filteredData].sort((a, b) => {
//     if (sortOrder === "asc") {
//       return a.allownce.localeCompare(b.allownce);
//     }
//     return b.allownce.localeCompare(a.allownce);
//   });

//   // Pagination calculations
//   const totalPages = Math.ceil(sortedData.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentData = sortedData.slice(startIndex, endIndex);

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         duration: 0.3,
//         when: "beforeChildren",
//         staggerChildren: 0.1
//       }
//     }
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: { type: "spring", stiffness: 300, damping: 24 }
//     }
//   };

//   const generatePaginationItems = () => {
//     const items = [];
//     const maxVisiblePages = 5;
    
//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) {
//         items.push(i);
//       }
//     } else {
//       if (currentPage <= 3) {
//         for (let i = 1; i <= 3; i++) items.push(i);
//         items.push('ellipsis');
//         items.push(totalPages);
//       } else if (currentPage >= totalPages - 2) {
//         items.push(1);
//         items.push('ellipsis');
//         for (let i = totalPages - 2; i <= totalPages; i++) items.push(i);
//       } else {
//         items.push(1);
//         items.push('ellipsis');
//         items.push(currentPage - 1);
//         items.push(currentPage);
//         items.push(currentPage + 1);
//         items.push('ellipsis');
//         items.push(totalPages);
//       }
//     }
//     return items;
//   };

//   return (
//     <div className="min-h-screen bg-[#FAF9F6]">
//       <Header heading="Allowances" />
//       <motion.div 
//         className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//       >
//         <Card className="bg-[#181C14] border border-white/10 shadow-xl">
//           <CardContent className="p-8">
//             {/* Header Section */}
//             <motion.div 
//               className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
//               variants={itemVariants}
//             >
//               <div className="space-y-2">
//                 <h1 className="text-4xl font-bold text-white tracking-tight">
//                   Allowance Management
//                 </h1>
//                 <p className="text-gray-400">
//                   Manage and track employee allowances efficiently
//                 </p>
//               </div>
//               <motion.div
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <Button
//                   onClick={() => openModal()}
//                   className="bg-white text-[#181C14] hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-white/20"
//                 >
//                   <Plus className="w-5 h-5 mr-2" />
//                   Add Allowance
//                 </Button>
//               </motion.div>
//             </motion.div>

//             {/* Search and Filter Section */}
//             <motion.div 
//               className="mb-6 flex flex-col sm:flex-row gap-4"
//               variants={itemVariants}
//             >
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <Input
//                   placeholder="Search allowances..."
//                   className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 w-full"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//               <Button
//                 variant="outline"
//                 onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
//                 className="border-white/10 text-black hover:bg-white/5"
//               >
//                 Sort
//                 <ChevronDown 
//                   className={`ml-2 h-4 w-4 transform transition-transform ${
//                     sortOrder === "desc" ? "rotate-180" : ""
//                   }`}
//                 />
//               </Button>
//             </motion.div>

//             {/* Main Content */}
//             {isLoading ? (
//               <div className="flex justify-center items-center h-64">
//                 <LoadingSpinner />
//               </div>
//             ) : (
//               <motion.div
//                 variants={containerVariants}
//                 className="relative overflow-hidden rounded-lg border border-white/10"
//               >
//                 <div className="overflow-x-auto">
//                   <Table>
//                     <TableHeader>
//                       <TableRow className="border-white/10 bg-white/5">
//                         <TableHead className="text-white font-medium py-5 px-6">Allowance</TableHead>
//                         <TableHead className="text-white font-medium py-5 px-6">Description</TableHead>
//                         <TableHead className="text-white font-medium py-5 px-6">Rate</TableHead>
//                         <TableHead className="text-white font-medium py-5 px-6">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       <AnimatePresence>
//                         {currentData.map((item) => (
//                           <motion.tr
//                             key={item._id}
//                             variants={itemVariants}
//                             initial="hidden"
//                             animate="visible"
//                             exit="hidden"
//                             className="border-white/10 hover:bg-white/5 transition-colors"
//                           >
//                             <TableCell className="py-4 px-6 text-white">{item.allownce}</TableCell>
//                             <TableCell className="py-4 px-6 text-gray-300">{item.allownce_description}</TableCell>
//                             <TableCell className="py-4 px-6 text-white font-medium">{item.rate}</TableCell>
//                             <TableCell className="py-4 px-6">
//                               <div className="flex gap-4">
//                                 <motion.button
//                                   whileHover={{ scale: 1.1 }}
//                                   whileTap={{ scale: 0.9 }}
//                                   onClick={() => openModal(item)}
//                                   className="text-blue-400 hover:text-blue-300 transition-colors"
//                                 >
//                                   <Edit className="w-5 h-5" />
//                                 </motion.button>
//                                 <motion.button
//                                   whileHover={{ scale: 1.1 }}
//                                   whileTap={{ scale: 0.9 }}
//                                   onClick={() => handleDelete(item._id)}
//                                   className="text-red-400 hover:text-red-300 transition-colors"
//                                 >
//                                   <Trash2 className="w-5 h-5" />
//                                 </motion.button>
//                               </div>
//                             </TableCell>
//                           </motion.tr>
//                         ))}
//                       </AnimatePresence>
//                     </TableBody>
//                   </Table>
//                 </div>

//                 {/* Pagination */}
//                 {sortedData.length > 0 && (
//                   <div className="mt-4 py-4 border-t border-white/10">
//                     <Pagination>
//                       <PaginationContent className="text-white">
//                         <PaginationItem>
//                           <PaginationPrevious
//                             className={`text-white ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
//                             onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
//                           />
//                         </PaginationItem>
                        
//                         {generatePaginationItems().map((item, index) => (
//                           <PaginationItem key={index}>
//                             {item === 'ellipsis' ? (
//                               <PaginationEllipsis className="text-white" />
//                             ) : (
//                               <PaginationLink
//                                 className={`text-white ${currentPage === item ? 'bg-white/20' : 'hover:bg-white/10'}`}
//                                 onClick={() => handlePageChange(item)}
//                                 isActive={currentPage === item}
//                               >
//                                 {item}
//                               </PaginationLink>
//                             )}
//                           </PaginationItem>
//                         ))}

//                         <PaginationItem>
//                           <PaginationNext
//                             className={`text-white ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
//                             onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
//                           />
//                         </PaginationItem>
//                       </PaginationContent>
//                     </Pagination>
//                   </div>
//                 )}
//               </motion.div>
//             )}

//             {/* Empty State */}
//             {!isLoading && sortedData.length === 0 && (
//               <motion.div 
//                 variants={itemVariants}
//                 className="text-center py-12"
//               >
//                 <p className="text-gray-400 text-lg">
//                   {searchTerm ? "No allowances found matching your search" : "No allowances added yet"}
//                 </p>
//               </motion.div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Modal */}
//         <AnimatePresence>
//           {isModalOpen && (
//             <Modal onClose={closeModal}>
//               <Component
//                 existingData={selectedData}
//                 onClose={closeModal}
//               />
//             </Modal>
//           )}
//         </AnimatePresence>
//       </motion.div>
//     </div>
//   );
// };

// export default AllowancesPage;

"use client"
import DataManagementPage from "@/components/DataManagement";
import Component from '@/components/Employee/Allownces'
import { useSession } from "next-auth/react";
// AllowancesPage.js
const Page = () => {

  const {data:session} = useSession();
  const employerId = session?.user?.username;

  // const fetchData = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await axios.get(`/api/employees/allownce?employerId=${employerId}`);
  //     setData(response.data.data);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleDelete = async (id) => {
  //   try {
  //     await axios.delete(`/api/employees/allownce/${id}`);
  //     await fetchData();
  //   } catch (error) {
  //     console.error('Error deleting data:', error);
  //   }
  // };

  const columns = [
    { key: 'allownce', header: 'Allowance' },
    { key: 'allownce_description', header: 'Description' },
    { key: 'rate', header: 'Rate' }
  ];

  return (
    <DataManagementPage
      pageTitle="Allowances"
      pageDescription="Manage and track employee allowances efficiently"
      addButtonText="Add Allowance"
      apiEndpoint={`/api/employees/allownce`}
      columns={columns}
      employerId={employerId}
      searchKeys={['allownce', 'allownce_description']}
      FormComponent={Component}
    />
  );
};

export default Page;