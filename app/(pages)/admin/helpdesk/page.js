"use client"
import Helpdesk from '@/components/Helpdesk/Helpdesk'
import React, { useState } from 'react'
import Header from '@/components/breadcumb'
import DataManagementPage from '@/components/DataManagement'
import { useSession } from 'next-auth/react'
import HelpdeskDashboard from '@/components/Helpdesk/HelpdeskDashboard'

const page = () => {
  const { data: session } = useSession();
  const [refreshDashboard, setRefreshDashboard] = useState(false);
  
  const employeeId = session?.user?.username;
  const IsAdmin = true
  const columns = [
    { key: 'complaintNumber', header: 'Complaint No' },
    {
      key: 'status',
      header: 'Status',

    }
  ];

  const handleStatusUpdate = () => {
    setRefreshDashboard((prev) => !prev); 
  };

  return (
    <div>
      <Header heading="Help Desk" />
      <HelpdeskDashboard refreshDashboard={refreshDashboard}  isAdmin={true} />
    

      <DataManagementPage
        pageTitle="Help Desk"
        pageDescription="Manage and track your complaints efficiently"
        addButtonText=""
        Helpdesk={true}
        apiEndpoint={"/api/helpdesk/admin"}
        columns={columns}
        employerId={employeeId}
        searchKeys={['complaintNumber', 'status']}
        FormComponent={Helpdesk}
        onStatusUpdate={handleStatusUpdate}
        userRole="admin"




      />
    </div>
  )
}

export default page;
