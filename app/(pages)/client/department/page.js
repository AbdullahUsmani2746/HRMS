"use client"
import DataManagementPage from "@/components/DataManagement";
import { useSession } from "next-auth/react";
// AllowancesPage.js

import { FileText } from 'lucide-react';
import DynamicFormComponent from "@/components/DynamicFormComponent";
import axios from "axios";

const DynamicComponent = ({ existingData, onClose }) => {
  const fields = [
    {
      name: 'department',
      label: 'Department',
      placeholder: 'Enter Department',
      icon: FileText,
      required: true
    },
    {
      name: 'department_description',
      label: 'Description',
      placeholder: 'Enter description',
      icon: FileText,
      required: true
    },
   
  ];

  const handleSubmit = async (data, isEditing, editIndex) => {
    try {
      if (isEditing) {
        await axios.put(`/api/employees/department/${data[editIndex]._id}`, data[editIndex]);
      } else {
        await axios.post('/api/employees/department', { data });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <DynamicFormComponent
      title="Department"
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
    { key: 'department', header: 'Department' },
    { key: 'department_description', header: 'Description' },
  ];

  return (
    <DataManagementPage
      pageTitle="Departments"
      pageDescription="Manage and track employee department efficiently"
      addButtonText="Add Department"
      apiEndpoint={`/api/employees/department`}
      columns={columns}
      employerId={employerId}
      searchKeys={['department', 'department_description']}
      FormComponent={DynamicComponent}
    />
  );
};

export default Page;