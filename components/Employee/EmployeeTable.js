import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Eye, EyeOff, Search, AlertCircle } from "lucide-react";
import PopupForm from "./popup-client";
import { columns_employee as defaultColumns } from "@/components/Employee/column";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoadingSpinner = () => (
  <motion.div
    animate={{
      rotate: 360,
    }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    }}
    className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
  />
);

const EmployeeTable = () => {
  const { data: session } = useSession();
  const clientId = session.user.username;
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
  const itemsPerPage = 5;

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
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
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-2">Employee Management</h1>
        <p className="text-muted-foreground">Manage your organization's workforce</p>
      </motion.div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <LoadingSpinner />
          <p className="text-muted-foreground animate-pulse">Loading employees...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search Employees"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-[300px] transition-all duration-300 focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
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
                  <Button variant="outline">Show/Hide Columns</Button>
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
              <Button onClick={() => openPopup(null)} className="bg-primary hover:bg-primary/90">
                Add Employee
              </Button>
            </div>
          </div>

          <motion.div
            variants={tableVariants}
            initial="hidden"
            animate="visible"
            className="rounded-lg border bg-card"
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[100px]">Profile</TableHead>
                  {columns.filter(col => col.isVisible).map((col) => (
                    <TableHead key={col.id}>{col.header}</TableHead>
                  ))}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {paginatedEmployees.map((employee) => (
                    <motion.tr
                      key={employee._id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Image
                            className="rounded-full ring-2 ring-primary/20"
                            src={employee.profileImage}
                            width={50}
                            height={50}
                            alt="Employee Profile"
                          />
                        </motion.div>
                      </TableCell>
                      {columns.filter(col => col.isVisible).map((col) => (
                        <TableCell key={col.id}>
                          {col.id === "status" ? (
                            <Badge variant={employee[col.id] === "ACTIVE" ? "success" : "secondary"}>
                              {employee[col.id]}
                            </Badge>
                          ) : col.id === "allownces" ? (
                            <div className="flex flex-wrap gap-1">
                              {employee[col.id]?.map((allownceId) => {
                                const matchedAllownce = allownce.find(
                                  (item) => item._id === allownceId
                                );
                                return (
                                  matchedAllownce && (
                                    <Badge variant="outline" key={allownceId}>
                                      {matchedAllownce.allownce}
                                    </Badge>
                                  )
                                );
                              })}
                            </div>
                          ) : col.id === "deductions" ? (
                            <div className="flex flex-wrap gap-1">
                              {employee[col.id]?.map((id) => {
                                const matchedDeduction = deduction.find(
                                  (item) => item._id === id
                                );
                                return (
                                  matchedDeduction && (
                                    <Badge variant="outline" key={id}>
                                      {matchedDeduction.deduction}
                                    </Badge>
                                  )
                                );
                              })}
                            </div>
                          ) : col.id === "department" ? (
                            <Badge variant="secondary">
                              {Department.find((dept) => dept._id === employee.department)?.department}
                            </Badge>
                          ) : col.id === "jobTitle" ? (
                            <Badge variant="secondary">
                              {Designation.find((des) => des._id === employee.jobTitle)?.job_title}
                            </Badge>
                          ) : (
                            employee[col.id]
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex space-x-3">
                          <motion.div whileHover={{ scale: 1.2 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openPopup(employee)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.2 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDelete(employee._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            <div className="p-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {[...Array(pageCount)].map((_, index) => (
                    <PaginationItem key={index + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(index + 1)}
                        isActive={currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                      disabled={currentPage === pageCount}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </motion.div>
        </motion.div>
      )}

      {isPopupOpen && (
        <PopupForm
          onClose={closePopup}
          setEmployees={setEmployees}
          employeeToEdit={employeeToEdit}
        />
      )}
    </div>
  );
};

export default EmployeeTable;