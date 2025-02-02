
"use client"
import DataManagementPage from "@/components/DataManagement";
import Component from '@/components/Employee/Manager'
import { useSession } from "next-auth/react";
// AllowancesPage.js
const Page = () => {

  const {data:session} = useSession();
  const employerId = session?.user?.username;
  const columns = [
    { key: 'manager', header: 'Manager' },
    { key: 'employeeId', header: 'Employee ID' },
    { key: 'departmentId', key2:"department" ,header: 'Department' },

  ];

  return (
    <DataManagementPage
      pageTitle="Manager"
      pageDescription="Manage and track manager efficiently"
      addButtonText="Add Manager"
      apiEndpoint={`/api/employees/manager`}
      columns={columns}
      employerId={employerId}
      searchKeys={['manager', 'employeeId']}
      FormComponent={Component}
    />
  );
};

export default Page;