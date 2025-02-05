"use client"
import { useState, useEffect } from "react";
import DataManagementPage from "@/components/DataManagement";
import { useSession } from "next-auth/react";
import {Briefcase, FileText } from 'lucide-react';
import DynamicFormComponent from "@/components/DynamicFormComponent";
import axios from "axios";

const DynamicComponent = ({ existingData, onClose }) => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "";
  const [department, setDepartment] = useState([]);


  // Fetch departments
  useEffect(() => {
    if (employerId) {
      const fetchDepartment = async () => {
        try {
          const response = await axios.get(`/api/employees/department?employerId=${employerId}`);
          setDepartment(response.data.data || []);
        } catch (error) {
          console.error("Error getting Department Data", error);
        }
      };
      fetchDepartment();
    }
  }, [employerId]);

  

  const fields = [
    {
      name: 'job_title',
      label: 'Job Title',
      placeholder: 'Enter job title',
      icon: Briefcase,
      required: true
    },
    {
      name: 'job_title_description',
      label: 'Job Description',
      placeholder: 'Enter job description',
      type: 'text',
      icon: FileText,
      required: true
    },
    {
      name: 'departmentId',
      label: 'Department',
      displayKey: 'department',  // This tells the component which property to use for display
      type: 'select',
      placeholder: 'Select Department',
      options: department.map(dept => ({
        value: dept._id,
        label: dept.department
      })),
      required: true
    }
  ];

  const handleSubmit = async (data, isEditing, editIndex) => {
    try {
      if (isEditing) {
        await axios.put(`/api/employees/jobTitle/${data[editIndex]._id}`, data[editIndex]);
      } else {
        await axios.post('/api/employees/jobTitle', { data });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <DynamicFormComponent
      title="Job Title"
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
    { key: 'job_title', header: 'Job Title' },
    { key: 'job_title_description', header: 'Description' },
    { key: 'departmentId', key2:"department" ,header: 'Department' },

  ];

  return (
    <DataManagementPage
      pageTitle="Job Tiltes"
      pageDescription="Manage and track employee job titles efficiently"
      addButtonText="Add Job Title"
      apiEndpoint={`/api/employees/jobTitle`}
      columns={columns}
      employerId={employerId}
      searchKeys={['job_title', 'job_title_description']}
      FormComponent={DynamicComponent}
    />
  );
};

export default Page;