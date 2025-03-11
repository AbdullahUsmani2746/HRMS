
"use client"
import DataManagementPage from "@/components/DataManagement";
import { useSession } from "next-auth/react";
import { FileText } from 'lucide-react';
import DynamicFormComponent from "@/components/DynamicFormComponent";
import axios from "axios";

const DynamicComponent = ({ existingData, onClose }) => {
  const fields = [
    {
      name: 'cost_center',
      label: 'Cost Center',
      placeholder: 'Enter cost center',
      icon: FileText,
      required: true
    },
    {
      name: 'cost_center_description',
      label: 'Description',
      placeholder: 'Enter description',
      icon: FileText,
      required: true
    },
   
  ];

  const handleSubmit = async (data, isEditing, editIndex) => {
    try {
      if (isEditing) {
        await axios.put(`/api/employees/costCenter/${data[editIndex]._id}`, data[editIndex]);
      } else {
        await axios.post('/api/employees/costCenter', { data });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <DynamicFormComponent
      title="Cost Center"
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
    { key: 'cost_center', header: 'Cost Center' },
    { key: 'cost_center_description', header: 'Description' },
  ];

  return (
    <DataManagementPage
      pageTitle="Cost Center"
      pageDescription="Manage and track employee types efficiently"
      addButtonText="Add Cost Center"
      apiEndpoint={`/api/employees/costCenter`}
      columns={columns}
      employerId={employerId}
      searchKeys={['cost_center', 'cost_center_description']}
      FormComponent={DynamicComponent}
    />
  );
};

export default Page;