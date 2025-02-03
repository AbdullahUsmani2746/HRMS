
"use client"
import DataManagementPage from "@/components/DataManagement";
import { useSession } from "next-auth/react";
import { FileText } from 'lucide-react';
import DynamicFormComponent from "@/components/DynamicFormComponent";
import axios from "axios";

const DynamicComponent = ({ existingData, onClose }) => {
  const fields = [
    {
      name: 'leave',
      label: 'Leave',
      placeholder: 'Enter Leave',
      icon: FileText,
      required: true
    },
    {
      name: 'leave_description',
      label: 'Description',
      placeholder: 'Enter description',
      icon: FileText,
      required: true
    },
   
  ];

  const handleSubmit = async (data, isEditing, editIndex) => {
    try {
      if (isEditing) {
        await axios.put(`/api/employees/leave/${data[editIndex]._id}`, data[editIndex]);
      } else {
        await axios.post('/api/employees/leave', { data });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <DynamicFormComponent
      title="Leaves"
      fields={fields}
      existingData={existingData}
      onSubmit={handleSubmit}
      onClose={onClose}
      allowMultiple={true}
    />
  );
};const Page = () => {

  const {data:session} = useSession();
  const employerId = session?.user?.username;
  const columns = [
    { key: 'leave', header: 'Leave' },
    { key: 'leave_description', header: 'Description' },
  ];

  return (
    <DataManagementPage
      pageTitle="Leaves"
      pageDescription="Manage and track employee leaves efficiently"
      addButtonText="Add Leave"
      apiEndpoint={`/api/employees/leave`}
      columns={columns}
      employerId={employerId}
      searchKeys={['leave', 'leave_description']}
      FormComponent={DynamicComponent}
    />
  );
};

export default Page;