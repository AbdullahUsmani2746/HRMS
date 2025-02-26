"use client"
import Helpdesk from '@/components/Helpdesk/Helpdesk'
import React from 'react'
import DataManagementPage from '@/components/DataManagement'
import { useSession } from 'next-auth/react'

const page = () => {
  const { data: session } = useSession();
  const employeeId = session?.user?.username;

  const columns = [
    { key: 'complaintNumber', header: 'Complaint No' },
    { 
      key: 'status', 
      header: 'Status',
     
    }
  ];

  return (
    <div>
      <DataManagementPage
        pageTitle="Help Desk"
        pageDescription="Manage and track your complaints efficiently"
        addButtonText="Report Issue"
        Helpdesk={true}
        apiEndpoint={employeeId ? `/api/helpdesk/${employeeId}` : null}
        columns={columns}
        employerId={employeeId}
        searchKeys={['complaintNumber', 'status']}
        FormComponent={Helpdesk}
        

      />
    </div>
  )
}

export default page;
