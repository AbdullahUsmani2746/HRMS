"use client"
import Helpdesk from '@/components/Helpdesk/Helpdesk'
import React from 'react'
import DataManagementPage from '@/components/DataManagement'
import { useSession } from 'next-auth/react'
import { Badge } from "@/components/ui/badge"; 

const page = () => {
  const { data: session } = useSession();
  const employeeId = session?.user?.username;

  const columns = [
    { key: 'complaintNumber', header: 'Complaint No' },
    { 
      key: 'status', 
      header: 'Status',
      render: (status) => (
        <Badge 
          className={`text-white px-2 py-1 ${
            status === "In Progress" ? "bg-blue-500" :
            status === "Completed" ? "bg-green-500" :
            status === "Rejected" ? "bg-red-500" : "bg-gray-500"
          }`}
        >
          {status}
        </Badge>
      )
    }
  ];

  return (
    <div>
      <DataManagementPage
        pageTitle="Help Desk"
        pageDescription="Manage and track your complaints efficiently"
        addButtonText="Raise New Complaint"
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
