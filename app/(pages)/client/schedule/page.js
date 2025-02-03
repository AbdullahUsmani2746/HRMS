
"use client"
import DataManagementPage from "@/components/DataManagement";
import { useSession } from "next-auth/react";
import { FileText } from 'lucide-react';
import DynamicFormComponent from "@/components/DynamicFormComponent";
import axios from "axios";

const DynamicComponent = ({ existingData, onClose }) => {
  const fields = [
    {
      name: 'pay_schedule',
      label: 'Pay Schedule',
      placeholder: 'Enter Pay Schedule',
      icon: FileText,
      required: true
    },
    {
      name: 'pay_schedule_description',
      label: 'Description',
      placeholder: 'Enter description',
      icon: FileText,
      required: true
    },
   
  ];

  const handleSubmit = async (data, isEditing, editIndex) => {
    try {
      if (isEditing) {
        await axios.put(`/api/employees/schedule/${data[editIndex]._id}`, data[editIndex]);
      } else {
        await axios.post('/api/employees/schedule', { data });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <DynamicFormComponent
      title="Pay Schedule"
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
    { key: 'pay_schedule', header: 'Pay Schedule' },
    { key: 'pay_schedule_description', header: 'Description' },
  ];

  return (
    <DataManagementPage
      pageTitle="Pay Schedules"
      pageDescription="Manage and track employee pay schedules efficiently"
      addButtonText="Add Pay Schedule"
      apiEndpoint={`/api/employees/schedule`}
      columns={columns}
      employerId={employerId}
      searchKeys={['pay_schedule', 'pay_schedule_description']}
      FormComponent={DynamicComponent}
    />
  );
};

export default Page;