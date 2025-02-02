
"use client"
import DataManagementPage from "@/components/DataManagement";
import Component from '@/components/Employee/JobTitle'
import { useSession } from "next-auth/react";
// AllowancesPage.js
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
      FormComponent={Component}
    />
  );
};

export default Page;