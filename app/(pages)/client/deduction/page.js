
"use client"
import DataManagementPage from "@/components/DataManagement";
import { useSession } from "next-auth/react";
// AllowancesPage.js
import { DollarSign, FileText, Percent } from 'lucide-react';

import DynamicFormComponent from "@/components/DynamicFormComponent";
import axios from "axios";

const DynamicComponent = ({ existingData, onClose }) => {
  const fields = [
    {
      name: 'deduction',
      label: 'Deduction Name',
      placeholder: 'Enter deduction name',
      icon: DollarSign,
      required: true
    },
    {
      name: 'deduction_description',
      label: 'Description',
      placeholder: 'Enter description',
      icon: FileText,
      required: true
    },
    {
      name: 'rate',
      label: 'Rate',
      placeholder: 'Enter rate',
      type: 'text',
      icon: Percent,
      required: true
    }
  ];

  const handleSubmit = async (data, isEditing, editIndex) => {
    try {
      if (isEditing) {
        await axios.put(`/api/employees/deduction/${data[editIndex]._id}`, data[editIndex]);
      } else {
        await axios.post('/api/employees/deduction', { data });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <DynamicFormComponent
      title="Deduction"
      fields={fields}
      existingData={existingData}
      onSubmit={handleSubmit}
      onClose={onClose}
      allowMultiple={true}
    />
  );
};
const EmployeeTypePage = () => {

  const {data:session} = useSession();
  const employerId = session?.user?.username;
  const columns = [
    { key: 'deduction', header: 'Deduction' },
    { key: 'deduction_description', header: 'Deduction Description' },
    { key: 'rate', header: 'Rate' }

  ];

  return (
    <DataManagementPage
      pageTitle="Deductions"
      pageDescription="Manage and track employee deduction efficiently"
      addButtonText="Add Deduction"
      apiEndpoint={`/api/employees/deduction`}
      columns={columns}
      employerId={employerId}
      searchKeys={['deduction', 'deduction_description']}
      FormComponent={DynamicComponent}
    />
  );
};

export default EmployeeTypePage;