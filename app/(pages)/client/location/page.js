
"use client"
import DataManagementPage from "@/components/DataManagement";
import Component from '@/components/Employee/WorkLocation'
import { useSession } from "next-auth/react";
import { FileText } from 'lucide-react';
import DynamicFormComponent from "@/components/DynamicFormComponent";
import axios from "axios";

const DynamicComponent = ({ existingData, onClose }) => {
  const fields = [
    {
      name: 'work_location',
      label: 'Work Location',
      placeholder: 'Enter Work Location',
      icon: FileText,
      required: true
    },
    {
      name: 'work_location_description',
      label: 'Description',
      placeholder: 'Enter description',
      icon: FileText,
      required: true
    },
   
  ];

  const handleSubmit = async (data, isEditing, editIndex) => {
    try {
      if (isEditing) {
        await axios.put(`/api/employees/workLocation/${data[editIndex]._id}`, data[editIndex]);
      } else {
        await axios.post('/api/employees/workLocation', { data });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <DynamicFormComponent
      title="Work Location"
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
    { key: 'work_location', header: 'Work Location' },
    { key: 'work_location_description', header: 'Description' },
  ];

  return (
    <DataManagementPage
      pageTitle="Work Location"
      pageDescription="Manage and track employee work location efficiently"
      addButtonText="Add Work Location"
      apiEndpoint={`/api/employees/workLocation`}
      columns={columns}
      employerId={employerId}
      searchKeys={['work_location', 'work_location_description']}
      FormComponent={DynamicComponent}
    />
  );
};

export default Page;