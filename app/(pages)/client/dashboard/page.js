"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  elements,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import LoadingSpinner from "@/components/spinner";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [activeClients, setActiveClients] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state
  const [inactiveClients, setInactiveClients] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [subscriptionBreakdown, setSubscriptionBreakdown] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [turnoverRate, setTurnoverRate] = useState(0);
  const [userGrowth, setUserGrowth] = useState(0);
 


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
      {isLoading ? (<LoadingSpinner/>):
      (
        <div className="text-center">Dashboard</div>
      )
}
    </SidebarInset>
  );
};

export default Dashboard;
