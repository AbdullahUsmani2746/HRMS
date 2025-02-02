
"use client"
import DataManagementPage from "@/components/DataManagement";
import Component from '@/components/Employee/Leave'
import { useSession } from "next-auth/react";
// AllowancesPage.js
const Page = () => {

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
      FormComponent={Component}
    />
  );
};

export default Page;