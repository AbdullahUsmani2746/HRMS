import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/spinner";
import { Edit, Trash2, Eye, EyeOff, Search, AlertCircle , Plus} from "lucide-react";
import PopupForm from "./popup-client";
import { columns_employee as defaultColumns } from "@/components/Employee/column";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableHead, TableRow, TableCell, TableBody, TableHeader } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";



const EmployeeTable = () => {
 const { data: session } = useSession();
 const clientId = session?.user?.username || '';
 const router = useRouter();
 const [employees, setEmployees] = useState([]);
 const [deduction, setdeduction] = useState([]);
 const [Department, setDepartment] = useState([]);
 const [Designation, setDesignation] = useState([]);
 const [allownce, setAllownce] = useState([]);
 const [searchQuery, setSearchQuery] = useState("");
 const [statusFilter, setStatusFilter] = useState("All");
 const [isPopupOpen, setIsPopupOpen] = useState(false);
 const [columns, setColumns] = useState(defaultColumns);
 const [employeeToEdit, setEmployeeToEdit] = useState(null);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState(null);
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 30;

 const containerVariants = {
   hidden: { opacity: 0 },
   visible: {
     opacity: 1,
     transition: {
       staggerChildren: 0.1,
       delayChildren: 0.2
     }
   }
 };

 const itemVariants = {
  
   hidden: { opacity: 0, y: 20, scale: 0.95 },
   visible: {
     opacity: 1,
     y: 0,
     scale: 1,
     transition: {
       type: "spring",
       stiffness: 100,
       damping: 12
     }
   },
   hover: {
     scale: 1,
     backgroundColor: "rgba(247, 249, 242, 0.05)",
     transition: { duration: 0.2 }
   }
 };

 const fetchEmployees = async () => {
   setIsLoading(true);
   setError(null);
   try {
     const response = await axios.get(`/api/employees?employerId=${clientId}`);
     const response2 = await axios.get(`/api/employees/allownce?employerId=${clientId}`);
     const response3 = await axios.get(`/api/employees/deduction?employerId=${clientId}`);
     const department = await axios.get(`/api/employees/department?employerId=${clientId}`);
     const designation = await axios.get(`/api/employees/jobTitle?employerId=${clientId}`);

     setAllownce(response2.data.data);
     setdeduction(response3.data.data);
     setEmployees(response.data.data);
     setDepartment(department.data.data);
     setDesignation(designation.data.data);
   } catch (error) {
     setError("Failed to load employees. Please try again later.");
   } finally {
     setIsLoading(false);
   }
 };

 useEffect(() => {
   fetchEmployees();
 }, []);

 const filteredEmployees = employees.filter((employee) => {
   if (!employee || !employee.firstName) return false;
   const matchesSearchQuery = employee.firstName.toLowerCase().includes(searchQuery.toLowerCase());
   const matchesStatusFilter = statusFilter === "All" || employee.status === statusFilter;
   return matchesSearchQuery && matchesStatusFilter;
 });

 const paginatedEmployees = filteredEmployees.slice(
   (currentPage - 1) * itemsPerPage,
   currentPage * itemsPerPage
 );

 const pageCount = Math.ceil(filteredEmployees.length / itemsPerPage);

 const toggleColumn = (columnId) => {
   setColumns(prevColumns =>
     prevColumns.map(col =>
       col.id === columnId ? { ...col, isVisible: !col.isVisible } : col
     )
   );
 };

 const openPopup = (employee = null) => {
   setEmployeeToEdit(employee);
   setIsPopupOpen(true);
 };

 const closePopup = async () => {
   setIsPopupOpen(false);
   setEmployeeToEdit(null);
   fetchEmployees();
 };

 const handleDelete = async (id) => {
   if (window.confirm("Are you sure you want to delete this employee?")) {
     try {
       await axios.delete(`/api/employees/${id}`);
       setEmployees(employees.filter((employee) => employee._id !== id));
       fetchEmployees();
     } catch (error) {
       setError("Failed to delete employee. Please try again.");
     }
   }
 };

 return (
   <div 
   className="p-6 space-y-6 bg-foreground text-background rounded-xl p-8 overlow-auto">
     <motion.div
       initial={{ opacity: 0, y: -20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.6, ease: "easeOut" }}
       className="mb-6"
     >
       <h1 className="text-3xl font-bold mb-2 text-background">
         Employee Management
       </h1>
       <p className="text-background/70">Manage your organization&apos;s workforce</p>
     </motion.div>

     {error && (
       <Alert variant="destructive" className="mb-6 animate-in fade-in-50">
         <AlertCircle className="h-4 w-4" />
         <AlertDescription>{error}</AlertDescription>
       </Alert>
     )}

     {isLoading ? (
       <div className="flex justify-center items-center h-64">
<LoadingSpinner 
  variant="pulse"
  size="large"
  text="Processing..."
  fullscreen={true}
/>            </div>
     ) : (
       <motion.div
         variants={containerVariants}
         initial="hidden"
         animate="visible"
         className="space-y-6"
       >
         <div className="flex justify-between items-left flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
           <div className="relative flex-1 max-w-md">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-4 h-4" />
           <Input
               type="text"
               placeholder="Search Employees"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10 bg-background/5 border-background/10 text-background placeholder:text-background/40 w-full"
               />
           </div>
           <div className="flex items-center space-x-4">
             <Select value={statusFilter} onValueChange={setStatusFilter}>
               <SelectTrigger className="w-[180px] border-background/20">
                 <SelectValue placeholder="All Employees" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="All">All Employees</SelectItem>
                 <SelectItem value="ACTIVE">Active Employees</SelectItem>
                 <SelectItem value="INACTIVE">Inactive Employees</SelectItem>
               </SelectContent>
             </Select>
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" 
                className="border-background/10 text-foreground hover:bg-background/5"
                >Show/Hide Columns</Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent>
                 {columns.map((column) => (
                   <DropdownMenuItem key={column.id} onClick={() => toggleColumn(column.id)}>
                     {column.isVisible ? <Eye className="mr-2 text-blue-500" /> : <EyeOff className="mr-2 text-red-500" />}
                     {column.header}
                   </DropdownMenuItem>
                 ))}
               </DropdownMenuContent>
             </DropdownMenu>
             <Button onClick={() => openPopup(null)} 
                  className="bg-background text-foreground hover:bg-background/90 transition-all duration-200 shadow-lg hover:shadow-background/20"
                  >
                  <Plus className="w-5 h-5 mr-2" />

               Add Employee
             </Button>
           </div>
         </div>

         <motion.div
           variants={containerVariants}
           className="relative rounded-lg border border-background/10"
           >
           <Table className="text-white">
             <TableHeader>
             <TableRow className="border-background/10 bg-background/5">
             {/* <TableHead className="w-[100px] text-background font-medium py-3 px-3">Profile</TableHead> */}
                 {columns.filter(col => col.isVisible).map((col) => (
                   <TableHead className="text-background font-medium py-3 px-3" key={col.id}>{col.header}</TableHead>
                 ))}
                 <TableHead className="text-background font-medium py-3 px-3">Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               <AnimatePresence mode="wait">
                 {paginatedEmployees.map((employee) => (
                   <motion.tr
                     key={employee._id}
                     variants={itemVariants}
                     initial="hidden"
                     animate="visible"
                     exit="hidden"
                     whileHover="hover"
                     className="border-b border-background/10 "
                   >
                     {/* <TableCell>
                       <motion.div
                         whileHover={{ scale: 1.1}}
                         transition={{ type: "spring", stiffness: 300 }}
                       >
                         <Image
                           className="rounded-full ring-2 ring-blue-500/20"
                           src={employee.profileImage}
                           width={50}
                           height={50}
                           alt="Employee Profile"
                         />
                       </motion.div>
                     </TableCell> */}
                     {columns.filter(col => col.isVisible).map((col) => (
                       <TableCell key={col.id} >
                         {col.id === "status" ? (
                           <Badge 
                             className={`
                               ${employee[col.id] === "ACTIVE" 
                                 ? "bg-green-600/20 text-green-400 border-green-500" 
                                 : "bg-red-600/20 text-red-400 border-red-500"}
                               animate-in fade-in-50 border`
                             }
                           >
                             {employee[col.id]}
                           </Badge>
                         ) : col.id === "allownces" ? (
                           <div className="flex flex-wrap gap-1">
                             {employee[col.id]?.map((allownceId) => {
                               const matchedAllownce = allownce.find(item => item._id === allownceId);
                               return matchedAllownce && (
                                 <Badge 
                                   key={allownceId} 
                                   className="bg-blue-600/20 text-blue-400 border-blue-500 border"
                                 >
                                   {matchedAllownce.allownce}
                                 </Badge>
                               );
                             })}
                           </div>
                         ) : col.id === "deductions" ? (
                           <div className="flex flex-wrap gap-1">
                             {employee[col.id]?.map((id) => {
                               const matchedDeduction = deduction.find(item => item._id === id);
                               return matchedDeduction && (
                                 <Badge 
                                   variant="outline" 
                                   key={id} 
                                   className="bg-red-600/20 text-red-400 border-red-500 border"
                                 >
                                   {matchedDeduction.deduction}
                                 </Badge>
                               );
                             })}
                           </div>
                         ) : col.id === "department" ? (
                           <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-500 border">
                             {Department.find(dept => dept._id === employee.department)?.department}
                           </Badge>
                         ) : col.id === "jobTitle" ? (
                           <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-500 border">
                             {Designation.find(des => des._id === employee.jobTitle)?.job_title}
                           </Badge>
                         ) : (
                           col.id2 ? employee[col.id]+ ' ' + employee[col.id2] : employee[col.id] 
                         )}
                       </TableCell>
                     ))}
                     <TableCell>
                       <div className="flex pl-2 space-x-6">
                           <motion.button
                           whileHover={{ scale: 1.2 }}
                             size="icon"
                             onClick={() => openPopup(employee)}
                             className="text-blue-400 hover:text-blue-300 transition-colors"
                             >
                             <Edit className="h-4 w-4" />
                           </motion.button>
                           <motion.button
                            whileHover={{ scale: 1.2 }}
                             size="icon"
                             onClick={() => handleDelete(employee._id)}
                             className="text-red-400 hover:text-red-300 transition-colors"
                             >
                             <Trash2 className="h-4 w-4" />
                           </motion.button>
                       </div>
                     </TableCell>
                   </motion.tr>
                 ))}
               </AnimatePresence>
             </TableBody>
           </Table>

           <div className="p-4 border-t border-background/10">
             <Pagination>
               <PaginationContent>
                 <PaginationItem>
                   <PaginationPrevious
                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                     disabled={currentPage === 1}
                     className="hover:bg-background/10 text-background cursor-pointer"
                   />
                 </PaginationItem>
                 {[...Array(pageCount)].map((_, index) => (
                   <PaginationItem key={index + 1}>
                     <PaginationLink
                       onClick={() => setCurrentPage(index + 1)}
                       isActive={currentPage === index + 1}
                       className={
                         currentPage === index + 1 
                         ? "bg-background/20" 
                         : "hover-bg-background/10"
                       }
                     >
                       {index + 1}
                     </PaginationLink>
                   </PaginationItem>
                 ))}
                 <PaginationItem>
                   <PaginationNext
                     onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                     disabled={currentPage === pageCount}
                     className="hover:bg-background/10 text-background cursor-pointer"
                   />
                 </PaginationItem>
               </PaginationContent>
             </Pagination>
           </div>
         </motion.div>
       </motion.div>
     )}

     {isPopupOpen && (
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
       >
         <PopupForm
           onClose={closePopup}
           setEmployees={setEmployees}
           employeeToEdit={employeeToEdit}
         />
       </motion.div>
     )}
   </div>
 );
}

export default EmployeeTable;