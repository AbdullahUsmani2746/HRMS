import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Use router from the app directory
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import PopupForm from "./popupForm";
import { columns as defaultColumns } from "@/components/columns";
import { Button } from "@/components/ui/button"; // Assuming the Shadcn UI button component
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

const EmployerTable = () => {
  const router = useRouter(); // Initialize the router
  const [employers, setEmployers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [columns, setColumns] = useState(defaultColumns);
  const [employerToEdit, setEmployerToEdit] = useState(null); // Track the employer being edited

  // Fetch employers data
  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const response = await axios.get("/api/employers");
        setEmployers(response.data.data);
      } catch (error) {
        console.error("Error fetching employers:", error);
        alert("Failed to load employers. Please try again later.");
      }
    };
    fetchEmployers();
  }, []);

  // Filter employers based on search query and status filter
  const filteredEmployers = employers.filter((employer) => {
    if (!employer || !employer.businessName) return false; // Ensure valid data
    const matchesSearchQuery = employer.businessName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatusFilter =
      statusFilter === "All" || employer.status === statusFilter;
    return matchesSearchQuery && matchesStatusFilter;
  });

  // Toggle column visibility
  const toggleColumn = (columnId) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId ? { ...col, isVisible: !col.isVisible } : col
      )
    );
  };

  // Open popup form
  const openPopup = (employer = null) => {
    setEmployerToEdit(employer);
    setIsPopupOpen(true);
  };

  // Close popup form
  const closePopup = async () => {
    setIsPopupOpen(false);
    setEmployerToEdit(null);
    try {
      const response = await axios.get("/api/employers");
      setEmployers(response.data.data);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // Delete an employer
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employer?")) {
      try {
        await axios.delete(`/api/employers/${id}`);
        setEmployers(employers.filter((employer) => employer._id !== id));
      } catch (error) {
        console.error("Error deleting employer:", error);
        alert("Failed to delete employer. Please try again.");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <Input
          type="text"
          placeholder="Search employers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 w-[250px] border rounded-md"
        />
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Employers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Employers</SelectItem>
              <SelectItem value="ACTIVE">Active Employers</SelectItem>
              <SelectItem value="INACTIVE">Inactive Employers</SelectItem>
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
          <Button onClick={openPopup}>Add Employer</Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns
              .filter((col) => col.isVisible)
              .map((col) => (
                <TableHead key={col.id}>{col.header}</TableHead>
              ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployers.map((employer) => (
            <TableRow key={employer._id}>
              {columns
                .filter((col) => col.isVisible)
                .map((col) => (
                  <TableCell key={col.id}>{employer[col.id]}</TableCell>
                ))}
              <TableCell>
                <div className="flex space-x-2">
                  <Edit
                    aria-label="Edit employer"
                    className="cursor-pointer"
                    onClick={() => openPopup(employer)}
                  />
                  <Trash2
                    aria-label="Delete employer"
                    className="cursor-pointer"
                    onClick={() => handleDelete(employer._id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isPopupOpen && (
        <PopupForm
          onClose={closePopup}
          setEmployers={setEmployers}
          employerToEdit={employerToEdit}
        />
      )}
    </div>
  );
};

export default EmployerTable;
