"use client";
import Helpdesk from '@/components/Helpdesk/Helpdesk';
import React, { useState } from 'react';
import Header from '@/components/breadcumb';
import DataManagementPage from '@/components/DataManagement';
import { useSession } from 'next-auth/react';
import HelpdeskDashboard from '@/components/Helpdesk/HelpdeskDashboard';

const Page = () => {
  const { data: session } = useSession();
  const [refreshDashboard, setRefreshDashboard] = useState(false);

  const employeeId = session?.user?.username;
  const isResolver = true;
  const employerId = `CLIENT-${employeeId?.split("-")[0]}`;
  const id = isResolver ? employerId : employeeId;

  const columns = [
    { key: 'complaintNumber', header: 'Complaint No' },
    { key: 'status', header: 'Status' }
  ];

  const handleStatusUpdate = () => {
    setRefreshDashboard((prev) => !prev); 
  };

  return (
    <div>
      <Header heading="Help Desk" />
      
      {isResolver && <HelpdeskDashboard refreshDashboard={refreshDashboard} />}

      <DataManagementPage
        pageTitle="Help Desk"
        pageDescription="Manage and track your complaints efficiently"
        addButtonText={isResolver ? "" : "Report Issue"}
        Helpdesk={true}
        apiEndpoint={id ? `/api/helpdesk/${id}` : null}
        columns={columns}
        employerId={id}
        searchKeys={['complaintNumber', 'status']}
        FormComponent={Helpdesk}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default Page;
