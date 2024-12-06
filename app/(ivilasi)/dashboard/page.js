"use client";

import React, { useState, useEffect } from 'react';
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
  const [activeClients, setActiveClients] = useState(75); // Demo data
  const [inactiveClients, setInactiveClients] = useState(25); // Demo data
  const [totalClients, setTotalClients] = useState(100); // Demo data
  const [activeSubscriptions, setActiveSubscriptions] = useState(50); // Demo data
  const [subscriptionBreakdown, setSubscriptionBreakdown] = useState({ basic: 20, standard: 15, premium: 15 }); // Demo data
  const [totalRevenue, setTotalRevenue] = useState(5000); // Demo data
  const [activeUsers, setActiveUsers] = useState(150); // Demo data
  const [turnoverRate, setTurnoverRate] = useState(5); // Demo data
  const [userGrowth, setUserGrowth] = useState(10); // Demo data

  useEffect(() => {
    // This useEffect is left here for future data fetching if needed
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
          <Card title="Active Subscriptions" value={activeSubscriptions} />
          <Card title="Subscription Breakdown" value={`Basic: ${subscriptionBreakdown.basic}, Standard: ${subscriptionBreakdown.standard}, Premium: ${subscriptionBreakdown.premium}`} />
          <Card title="Total Revenue" value={`$${totalRevenue}`} />
          <Card title="Active Users" value={activeUsers} />
          <Card title="Turnover Rate" value={`${turnoverRate}%`} />
          <Card title="User Growth" value={`${userGrowth}%`} />
        </div>
      </div>
    </SidebarInset>
  );
};

export default Dashboard;
