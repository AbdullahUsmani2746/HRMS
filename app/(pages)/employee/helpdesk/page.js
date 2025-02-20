"use client"
import Helpdesk from '@/components/Helpdesk/Helpdesk'
import React from 'react'
import DataManagementPage from '@/components/DataManagement'
import { useSession } from 'next-auth/react'

const page = () => {


  const {data:session} = useSession();
  const employeeId = session?.user?.username;
  const columns = [
    { key: 'complaint_no', header: 'Complaint No' },
    { key: 'status', header: 'status' },
  ];
  return (
    <div>
      <DataManagementPage
      pageTitle="Help Desk"
      pageDescription="Manage and track employee allowances efficiently"
      addButtonText="Add Complaint"
      apiEndpoint={`/api/employees/tickets`}
      columns={columns}
      employerId={employeeId}
      searchKeys={['complaint_no', 'status']}
      FormComponent={Helpdesk}
    />
        {/* <Helpdesk/> */}
   
    </div>
  )
}

export default page