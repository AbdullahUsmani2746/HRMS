import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import PopupForm from "./popup-client";
import { columns_employee as defaultColumns } from "@/components/Employee/column";
import LoadingSpinner from "@/components/spinner";
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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableHeader,
} from "@/components/ui/table";

const EmployeeTable = () => {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [deduction, setdeduction] = useState([]);
  const [allownce, setAllownce] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [columns, setColumns] = useState(defaultColumns);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/employees");
      const response2 = await axios.get("/api/employees/allownce");
      const response3 = await axios.get("/api/employees/deduction");

      setAllownce(response2.data.data);
      setdeduction(response3.data.data);
      setEmployees(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to load employees. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // const filteredEmployees = employees.filter((employee) => {
  //   if (!employee || !employee.name) return false;
  //   const matchesSearchQuery = employee.name
  //     .toLowerCase()
  //     .includes(searchQuery.toLowerCase());
  //   const matchesStatusFilter =
  //     statusFilter === "All" || employee.status === statusFilter;
  //   return matchesSearchQuery && matchesStatusFilter;
  // });

  const filteredEmployees = employees.filter((employee) => {
    if (!employee || !employee.firstName) return false;
    const matchesSearchQuery = employee.firstName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatusFilter =
      statusFilter === "All" || employee.status === statusFilter;
    return matchesSearchQuery && matchesStatusFilter;
  });
  const toggleColumn = (columnId) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId ? { ...col, isVisible: !col.isVisible } : col
      )
    );
  };

  const openPopup = (employee = null) => {
    if (employee !== null) {
      setEmployeeToEdit(employee);
    } else {
      setEmployeeToEdit(null);
    }
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
        console.error("Error deleting employee:", error);
        alert("Failed to delete employee. Please try again.");
      }
    }
  };

  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <Input
              type="text"
              placeholder="Search Employees"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 w-[300px] border rounded-md bg-foreground text-white placeholder:text-white"
            />
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
                  <Button>Show/Hide Columns</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {columns.map((column) => (
                    <DropdownMenuItem
                      key={column.id}
                      onClick={() => toggleColumn(column.id)}
                    >
                      {column.isVisible ? <Eye /> : <EyeOff />} {column.header}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => openPopup(null)}>Add Employee</Button>
            </div>
          </div>
          <Table className="shadow-md rounded-lg border-separate">
            <TableHeader>
              <TableRow className="bg-foreground text-left">
                {columns
                  .filter((col) => col.isVisible)
                  .map((col) => (
                    <TableHead
                      className="px-4 py-2 font-semibold text-white text-[12px]"
                      key={col.id}
                    >
                      {col.header}
                    </TableHead>
                  ))}
                <TableHead className="px-4 py-2 font-semibold text-white text-[12px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow
                  key={employee._id}
                  className="bg-background shadow-lg rounded-lg border-separate"
                >
                  {columns
                    .filter((col) => col.isVisible)
                    .map((col) => (
                      <TableCell className="px-4" key={col.id}>
                        {col.id === "allownces" ? (
                          <ul className="list-disc px-4">
                            {employee[col.id]?.map((allownceId) => {
                              const matchedAllownce = allownce.find(
                                (item) => item._id === allownceId
                              );
                              return (
                                matchedAllownce && (
                                  <li className="text-sm" key={allownceId}>
                                    {matchedAllownce.allownce}
                                  </li>
                                )
                              );
                            })}
                          </ul>
                        ) : col.id === "deductions" ? (
                          <ul className="list-disc px-4">
                            {employee[col.id]?.map((id) => {
                              const matchedDeduction = deduction.find(
                                (item) => item._id === id
                              );
                              return (
                                matchedDeduction && (
                                  <li className="text-sm" key={id}>
                                    {matchedDeduction.deduction}
                                  </li>
                                )
                              );
                            })}
                          </ul>
                        ) : (
                          employee[col.id] // Default rendering logic for other columns
                        )}
                      </TableCell>
                    ))}
                  <TableCell>
                    <div className="flex space-x-2">
                      <Edit
                        aria-label="Edit employee"
                        className="cursor-pointer"
                        onClick={() => openPopup(employee)}
                      />
                      <Trash2
                        aria-label="Delete employee"
                        className="cursor-pointer"
                        onClick={() => handleDelete(employee._id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
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
