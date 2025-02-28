"use client";
import Helpdesk from '@/components/Helpdesk/Helpdesk';
import React from 'react';
import DataManagementPage from '@/components/DataManagement';
import HelpdeskDashboard from '@/components/Helpdesk/HelpdeskDashboard';
import { useSession } from 'next-auth/react';
import Header from '@/components/breadcumb';

const Page = () => {
  const { data: session } = useSession();
  const employeeId = session?.user?.username;
  const userRole = session?.user?.role;

  const columns = [
    { key: 'complaintNumber', header: 'Complaint No' },
    { key: 'status', header: 'Status' }
  ];

  return (
    <div>
      <Header heading="Help Desk"/>
      {userRole === 'Admin' && <HelpdeskDashboard  />}

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
  );
};

export default Page;
