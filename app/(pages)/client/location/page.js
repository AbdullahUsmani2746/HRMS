
"use client"
import DataManagementPage from "@/components/DataManagement";
import Component from '@/components/Employee/WorkLocation'
import { useSession } from "next-auth/react";
// AllowancesPage.js
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
      FormComponent={Component}
    />
  );
};

export default Page;