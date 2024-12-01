import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '@/components/DataTable';
import PopupForm from './popupForm';
import { columns } from '@/components/columns';
import { Button } from '@/components/ui/button'; // Assuming the Shadcn UI button component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';

const EmployerTable = () => {
  const [employers, setEmployers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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

  return (
    <div>
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-md bg-inherit	"
        />
        <div className="flex items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}> <SelectTrigger className="w-[180px]"> <SelectValue placeholder="All Clients" /> </SelectTrigger> <SelectContent> <SelectItem value="All">All Clients</SelectItem> <SelectItem value="ACTIVE">Active Clients</SelectItem> <SelectItem value="INACTIVE">Inactive Clients</SelectItem> </SelectContent> </Select>
        <Button onClick={openPopup} className="ml-4" > Add Client </Button>
        </div>
      </div>
      <DataTable columns={columns} data={filteredEmployers} />
      {isPopupOpen && <PopupForm onClose={closePopup} />}
    </div>
  );
};

export default EmployerTable;
