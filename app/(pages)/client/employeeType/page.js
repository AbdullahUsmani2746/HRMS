




"use client"
import DataManagementPage from "@/components/DataManagement";
import Component from '@/components/Employee/Employee_type'
import { useSession } from "next-auth/react";
// AllowancesPage.js

import { FileText } from 'lucide-react';
import DynamicFormComponent from "@/components/DynamicFormComponent";
import axios from "axios";

const DynamicComponent = ({ existingData, onClose }) => {
  const fields = [
    {
      name: 'employee_type',
      label: 'Employee Tye',
      placeholder: 'Enter Employee Type',
      icon: FileText,
      required: true
    },
    {
      name: 'employee_type_description',
      label: 'Description',
      placeholder: 'Enter description',
      icon: FileText,
      required: true
    },
   
  ];

  const handleSubmit = async (data, isEditing, editIndex) => {
    try {
      if (isEditing) {
        await axios.put(`/api/employees/employeeType/${data[editIndex]._id}`, data[editIndex]);
      } else {
        await axios.post('/api/employees/employeeType', { data });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <DynamicFormComponent
      title="Employee Type"
      fields={fields}
      existingData={existingData}
      onSubmit={handleSubmit}
      onClose={onClose}
      allowMultiple={true}
    />
  );
};
const Page = () => {

  const {data:session} = useSession();
  const employerId = session?.user?.username;
  const columns = [
    { key: 'employee_type', header: 'Employee Type' },
    { key: 'employee_type_description', header: 'Description' },
  ];

  return (
    <DataManagementPage
      pageTitle="Employee Type"
      pageDescription="Manage and track employee types efficiently"
      addButtonText="Add Employee Types"
      apiEndpoint={`/api/employees/employeeType`}
      columns={columns}
      employerId={employerId}
      searchKeys={['employee_type', 'employee_type_description']}
      FormComponent={DynamicComponent}
    />
  );
};

export default Page;