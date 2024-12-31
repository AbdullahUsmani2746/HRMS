"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card-manual";
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
import Header from "@/components/breadcumb";

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
    <>
      <Header heading="Dashboard" />
      {isLoading ? (<LoadingSpinner/>):
      (
        <div className="text-center">Dashboard</div>
      )
}
    </>
  );
};

export default Dashboard;
