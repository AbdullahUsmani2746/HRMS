




"use client"
import DataManagementPage from "@/components/DataManagement";
import Component from '@/components/Employee/Employee_type'
import { useSession } from "next-auth/react";
// AllowancesPage.js
const Page = () => {

  const {data:session} = useSession();
  const employerId = session?.user?.username;
  const columns = [
    { key: 'employee_type', header: 'Employee Type' },
    { key: 'employee_type_description', header: 'Description' },
  ];

  return (
    <DataManagementPage
      pageTitle="Employee Type"
      pageDescription="Manage and track employee types efficiently"
      addButtonText="Add Employee Types"
      apiEndpoint={`/api/employees/employeeType`}
      columns={columns}
      employerId={employerId}
      searchKeys={['employee_type', 'employee_type_description']}
      FormComponent={Component}
    />
  );
};

export default Page;