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
  const [plan, setPlan] = useState([]);
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
        const responsePlan = await axios.get("/api/subscriptionPlanMaster");
        setPlan(responsePlan.data.data);
      } catch (error) {
        console.error("Error fetching employers:", error);
        alert("Failed to load employers. Please try again later.");
      }
    };
    console.log(employers);
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
  const openPopup = (employers = null) => {
    if (employers !== null) {
      console.log(employers);
      setEmployerToEdit(employers);
    } else {
      setEmployerToEdit(null);
    }
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
          placeholder="Search Clients by business name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 w-[300px] border rounded-md bg-foreground text-white placeholder:text-white"
        />
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Clients</SelectItem>
              <SelectItem value="ACTIVE">Active Clients</SelectItem>
              <SelectItem value="INACTIVE">Inactive Clients</SelectItem>
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
          <Button onClick={() => openPopup(null)}>Add Client</Button>
        </div>
      </div>
      <Table className="shadow-md rounded-lg border-separate">
        <TableHeader>
          <TableRow className="bg-foreground text-left ">
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
            <TableHead className="px-4 py-2 font-semibold text-white text-[12px] ">
              Plan
            </TableHead>
            <TableHead className="px-4 py-2 font-semibold text-white text-[12px] ">
              Subscription Fee
            </TableHead>
            <TableHead className="px-4 py-2 font-semibold text-white text-[12px] ">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployers.map((employer) => (
            <TableRow
              key={employer._id}
              className="bg-background shadow-lg rounded-lg border-separate "
            >
              {columns
                .filter((col) => col.isVisible)
                .map((col) => (
                  <TableCell className="px-4" key={col.id}>
                    {col.id === "contactPerson"
                      ? `${employer.cpFirstName || ""} ${
                          employer.cpSurname || ""
                        }` // Safely access fields
                      : employer[col.id]}
                  </TableCell>
                ))}
              <TableCell className="px-4">
                {plan
                  .filter((plan) => plan._id === employer.subscriptionPlan)
                  .map((matchedPlan) => (
                    <span
                      key={matchedPlan._id}
                    >{`${matchedPlan.planName}`}</span>
                  ))}
              </TableCell>

              <TableCell className="px-4">
              {plan
                  .filter((plan) => plan._id === employer.subscriptionPlan)
                  .map((matchedPlan) => (
                    <span
                      key={matchedPlan._id}
                    >{`$${matchedPlan.subscriptionFee}`}</span>
                  ))}
              </TableCell>
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
