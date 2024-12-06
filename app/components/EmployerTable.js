import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import PopupForm from './popupForm';
import { columns as defaultColumns } from '@/components/columns';
import { Button } from '@/components/ui/button'; // Assuming the Shadcn UI button component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableHead, TableRow, TableCell, TableBody, TableHeader } from '@/components/ui/table';

const EmployerTable = () => {
  const [employers, setEmployers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [columns, setColumns] = useState(defaultColumns);

  useEffect(() => {
    axios.get('/api/employers')
      .then(response => setEmployers(response.data.data))
      .catch(error => console.error(error));
  }, []);

  const filteredEmployers = employers.filter(employer => {
    const matchesSearchQuery = employer.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatusFilter = statusFilter === 'All' || employer.status === statusFilter;
    return matchesSearchQuery && matchesStatusFilter;
  });

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  const toggleColumn = (columnId) => {
    setColumns(prevColumns =>
      prevColumns.map(col =>
        col.id === columnId ? { ...col, isVisible: !col.isVisible } : col
      )
    );
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/employers/${id}`);
      setEmployers(employers.filter(employer => employer._id !== id));
    } catch (error) {
      console.error('Error deleting employer:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <Input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 w-[250px] border rounded-md"
        />
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Clients" />
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
              {columns.map(column => (
                <DropdownMenuItem key={column.id} onClick={() => toggleColumn(column.id)}>
                  {column.isVisible ? <Eye /> : <EyeOff />} {column.header}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={openPopup}>Add Client</Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.filter(col => col.isVisible).map(col => (
              <TableHead key={col.id}>{col.header}</TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployers.map((employer, idx) => (
            <TableRow key={employer._id || idx}>
              {columns.filter(col => col.isVisible).map(col => (
                <TableCell key={col.id}>{employer[col.id]}</TableCell>
              ))}
              <TableCell>
                <div className="flex space-x-2">
                  <Edit className="cursor-pointer" onClick={() => openPopup(employer)} />
                  <Trash2 className="cursor-pointer" onClick={() => handleDelete(employer._id)} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isPopupOpen && <PopupForm onClose={closePopup} />}
    </div>
  );
};

export default EmployerTable;
