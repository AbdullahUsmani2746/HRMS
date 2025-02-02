// "use client";
// import React, { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from "framer-motion";
// import { Edit, Trash2, Plus, Search, ChevronDown } from "lucide-react";
// import { useSession } from "next-auth/react";
// import { format } from "date-fns";
// import Component from '@/components/Employee/costCenter'
// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from '@/components/ui/button';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import Header from "@/components/breadcumb";
// import LoadingSpinner from "@/components/spinner";
// import Modal from '@/components/Modal';
// import axios from 'axios';

// // Common animations and utilities
// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       duration: 0.3,
//       when: "beforeChildren",
//       staggerChildren: 0.1
//     }
//   }
// };

// const itemVariants = {
//   hidden: { y: 20, opacity: 0 },
//   visible: {
//     y: 0,
//     opacity: 1,
//     transition: { type: "spring", stiffness: 300, damping: 24 }
//   }
// };

// // Enhanced CostCenter Component
//  const EnhancedCostCenter = () => {
//   const { data: session } = useSession();
//   const employerId = session?.user?.username;
//   const [isLoading, setIsLoading] = useState(false);
//   const [data, setData] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedData, setSelectedData] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortOrder, setSortOrder] = useState("asc");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   // ... (fetch, open/close modal, delete handlers remain the same)
  
//   useEffect(() => {
//     const fetchData= async () => {
//       setIsLoading(true)
//       try {
//         const response = await axios.get(`/api/employees/costCenter?employerId=${employerId}`);
//         setData(response.data.data);
//       } catch (error) {
//         console.error('Error fetching datas:', error);
//       } finally {
//         setIsLoading(false);  // Set loading to false once data is fetched
//       }
//     };
//     fetchData();
//   }, []);

//   const openModal = (data = null) => {
//     setSelectedData(data); // Set selected data if editing
//     setIsModalOpen(true);
//   };

//   const closeModal = async() => {
//     setIsModalOpen(false);
//     setSelectedData(null); // Clear selected data
//     const response = await axios.get(`/api/employees/costCenter?employerId=${employerId}`);
//     setData(response.data.data); // Update the state with the fresh data  
//     };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`/api/employees/costCenter/${id}`);
//       setData(data.filter(data => data._id !== id)); // Remove deleted application from state


//     } catch (error) {
//       console.error('Error deleting data:', error);
//     }
//   };

//   const filteredData = data.filter(item =>
//     item.cost_center.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.cost_center_description.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const sortedData = [...filteredData].sort((a, b) => {
//     return sortOrder === "asc" 
//       ? a.cost_center.localeCompare(b.cost_center)
//       : b.cost_center.localeCompare(a.cost_center);
//   });

//   const totalPages = Math.ceil(sortedData.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);

//   return (
//     <div className="min-h-screen bg-[#fff]">
//       <Header heading="Cost Center" />
//       <motion.div
//         className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//       >
//         <Card className="bg-[#181C14] border border-white/10 shadow-xl">
//           <CardContent className="p-8">
//             <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
//               <div className="space-y-2">
//                 <h1 className="text-4xl font-bold text-white tracking-tight">
//                   Cost Center Management
//                 </h1>
//                 <p className="text-gray-400">
//                   Manage and organize cost centers efficiently
//                 </p>
//               </div>
//               <Button
//                 onClick={() => openModal()}
//                 className="bg-white text-[#181C14] hover:bg-white/90"
//               >
//                 <Plus className="w-5 h-5 mr-2" />
//                 Add Cost Center
//               </Button>
//             </motion.div>

//             {/* Search and Sort Section */}
//             <motion.div variants={itemVariants} className="mb-6 flex flex-col sm:flex-row gap-4">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <Input
//                   placeholder="Search cost centers..."
//                   className="pl-10 bg-white/5 border-white/10 text-white"
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
//                 <ChevronDown className={`ml-2 h-4 w-4 transform transition-transform ${
//                   sortOrder === "desc" ? "rotate-180" : ""
//                 }`} />
//               </Button>
//             </motion.div>

//             {/* Table Section */}
//             {isLoading ? (
//               <div className="flex justify-center items-center h-64">
//                 <LoadingSpinner />
//               </div>
//             ) : (
//               <motion.div variants={containerVariants} className="relative overflow-hidden rounded-lg border border-white/10">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="border-white/10 bg-white/5">
//                       <TableHead className="text-white">Cost Center</TableHead>
//                       <TableHead className="text-white">Description</TableHead>
//                       <TableHead className="text-white">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     <AnimatePresence>
//                       {currentData.map((item) => (
//                         <motion.tr
//                           key={item._id}
//                           variants={itemVariants}
//                           initial="hidden"
//                           animate="visible"
//                           exit="hidden"
//                           className="border-white/10 hover:bg-white/5"
//                         >
//                           <TableCell className="text-white">{item.cost_center}</TableCell>
//                           <TableCell className="text-gray-300">{item.cost_center_description}</TableCell>
//                           <TableCell>
//                             <div className="flex gap-4">
//                               <motion.button
//                                 whileHover={{ scale: 1.1 }}
//                                 whileTap={{ scale: 0.9 }}
//                                 onClick={() => openModal(item)}
//                                 className="text-blue-400 hover:text-blue-300"
//                               >
//                                 <Edit className="w-5 h-5" />
//                               </motion.button>
//                               <motion.button
//                                 whileHover={{ scale: 1.1 }}
//                                 whileTap={{ scale: 0.9 }}
//                                 onClick={() => handleDelete(item._id)}
//                                 className="text-red-400 hover:text-red-300"
//                               >
//                                 <Trash2 className="w-5 h-5" />
//                               </motion.button>
//                             </div>
//                           </TableCell>
//                         </motion.tr>
//                       ))}
//                     </AnimatePresence>
//                   </TableBody>
//                 </Table>

//                 {/* Pagination */}
//                 {sortedData.length > 0 && (
//                   <div className="mt-4 py-4 border-t border-white/10">
//                     <Pagination>
//                       <PaginationContent className="text-white">
//                         <PaginationItem>
//                           <PaginationPrevious
//                             className={`text-white ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
//                             onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
//                           />
//                         </PaginationItem>
//                         {/* Generate page numbers */}
//                         {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                           <PaginationItem key={page}>
//                             <PaginationLink
//                               className={`text-white ${currentPage === page ? 'bg-white/20' : 'hover:bg-white/10'}`}
//                               onClick={() => setCurrentPage(page)}
//                               isActive={currentPage === page}
//                             >
//                               {page}
//                             </PaginationLink>
//                           </PaginationItem>
//                         ))}
//                         <PaginationItem>
//                           <PaginationNext
//                             className={`text-white ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
//                             onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
//                           />
//                         </PaginationItem>
//                       </PaginationContent>
//                     </Pagination>
//                   </div>
//                 )}
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

// export default EnhancedCostCenter;

"use client"
import DataManagementPage from "@/components/DataManagement";
import Component from '@/components/Employee/costCenter'
import { useSession } from "next-auth/react";
// AllowancesPage.js
const Page = () => {

  const {data:session} = useSession();
  const employerId = session?.user?.username;
  const columns = [
    { key: 'cost_center', header: 'Cost Center' },
    { key: 'cost_center_description', header: 'Description' },
  ];

  return (
    <DataManagementPage
      pageTitle="Cost Center"
      pageDescription="Manage and track employee types efficiently"
      addButtonText="Add Cost Center"
      apiEndpoint={`/api/employees/costCenter`}
      columns={columns}
      employerId={employerId}
      searchKeys={['cost_center', 'cost_center_description']}
      FormComponent={Component}
    />
  );
};

export default Page;