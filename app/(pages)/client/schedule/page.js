
"use client"
import DataManagementPage from "@/components/DataManagement";
import Component from '@/components/Employee/PaySchedule'
import { useSession } from "next-auth/react";
// AllowancesPage.js
const Page = () => {

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
      FormComponent={Component}
    />
  );
};

export default Page;