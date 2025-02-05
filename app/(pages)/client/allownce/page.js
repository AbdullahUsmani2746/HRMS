"use client"
import DataManagementPage from "@/components/DataManagement";
import { useSession } from "next-auth/react";
import { DollarSign, FileText, Percent } from 'lucide-react';
import DynamicFormComponent from "@/components/DynamicFormComponent";
import axios from "axios";

const DynamicComponent = ({ existingData, onClose }) => {
  const fields = [
    {
      name: 'allownce',
      label: 'Allowance Name',
      placeholder: 'Enter allowance name',
      icon: DollarSign,
      required: true
    },
    {
      name: 'allownce_description',
      label: 'Description',
      placeholder: 'Enter description',
      icon: FileText,
      required: true
    },
    {
      name: 'rate',
      label: 'Rate',
      placeholder: 'Enter rate',
      type: 'number',
      icon: Percent,
      required: true
    }
  ];

  const handleSubmit = async (data, isEditing, editIndex) => {
    try {
      if (isEditing) {
        await axios.put(`/api/employees/allownce/${data[editIndex]._id}`, data[editIndex]);
      } else {
        await axios.post('/api/employees/allownce', { data });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <DynamicFormComponent
      title="Allowance"
      fields={fields}
      existingData={existingData}
      onSubmit={handleSubmit}
      onClose={onClose}
      allowMultiple={true}
    />
  );
};
  

// AllowancesPage.js
const Page = () => {

  const {data:session} = useSession();
  const employerId = session?.user?.username;

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
      FormComponent={DynamicComponent}
    />
  );
};

export default Page;