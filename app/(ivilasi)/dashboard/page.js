"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const Dashboard = () => {
  const [activeClients, setActiveClients] = useState(0);
  const [inactiveClients, setInactiveClients] = useState(0);
  const [totalClients, setTotalClients] = useState(0);

  useEffect(() => {
    // Fetch data from API and update state
    axios.get('/api/employers')
      .then(response => {
        const employers = response.data.data;
        const active = employers.filter(emp => emp.status === 'ACTIVE').length;
        const inactive = employers.filter(emp => emp.status === 'INACTIVE').length;
        setActiveClients(active);
        setInactiveClients(inactive);
        setTotalClients(employers.length);
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Hr Management Software</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card title="Total Clients" value={totalClients} />
          <Card title="Active Clients" value={activeClients} />
          <Card title="Inactive Clients" value={inactiveClients} />
          <Card title="Engagement" value={`${((activeClients / totalClients) * 100).toFixed(2)}%`} />
        </div>
      </div>
    </SidebarInset>
  );
};

export default Dashboard;
