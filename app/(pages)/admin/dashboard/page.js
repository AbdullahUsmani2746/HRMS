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
   // Fetch data from APIs
   const fetchData = async () => {
    setIsLoading(true)
    try {
      // Example: Replace with your API endpoint
      const clientsResponse = await axios.get("/api/employers");
      const clientsData = await clientsResponse.data.data;

      const plansResponse = await axios.get("/api/subscriptionPlanMaster");

      const plansData = await plansResponse.data.data;

  console.log(clientsData)
      // Calculate dynamic values
      const active = clientsData.filter((client) => client.status === "ACTIVE").length;
      const inactive = clientsData.filter((client) => client.status === "INACTIVE").length;

      const revenue = clientsData.reduce((sum, client) => {
        // Find the plan matching the client's planId
        const plan = plansData.find(plan => plan._id === client.subscriptionPlan);
        // Add the subscriptionFee to the total revenue if the plan exists
        return sum + (plan ? plan.subscriptionFee : 0);
      }, 0);
      const subscriptions = plansData.reduce((breakdown, plan) => {
        const count = clientsData.filter((client) => client.subscriptionPlan === plan._id).length;
        return { ...breakdown, [plan.planName]: count };
      }, {});

      setActiveClients(active);
      setInactiveClients(inactive);
      setTotalClients(clientsData.length);
      setActiveSubscriptions(active);
      setTotalRevenue(revenue);
      setSubscriptionBreakdown(subscriptions);

      // Example calculations for turnover and growth
      setTurnoverRate(((inactive / clientsData.length) * 100).toFixed(2));
      setUserGrowth(10); // Static for demo, replace with real calculation
      setActiveUsers(clientsData.length); // Assuming each client corresponds to a user
    } catch (error) {
      console.error("Error fetching data:", error);
    }finally{
      setIsLoading(false)
    }
  };
  useEffect(() => {
 

    fetchData();
  }, []);

  // Chart data for subscription breakdown
  const chartData = {
    labels: Object.keys(subscriptionBreakdown),
    datasets: [
      {
        label: "Subscriptions",
        data: Object.values(subscriptionBreakdown),
        backgroundColor: ["#c41e3a", "#2196F3", "#FF9800"],
        borderRadius: 15,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "#f5f5f5", titleColor: "#333", bodyColor: "#666" },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#999" } },
      y: { grid: { color: "#eee" }, ticks: { color: "#999" } ,
      beginAtZero: true, // Start the Y-axis from zero
      stepSize: 1, // Increment by whole numbers
    },
    },
  };

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
      (<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Total Clients" value={totalClients} />
          <Card title="Active Clients" value={activeClients} />
          <Card title="Inactive Clients" value={inactiveClients} />
          <Card title="Engagement" value={`${((activeClients / totalClients) * 100).toFixed(2)}%`} />
          <Card title="Active Subscriptions" value={activeSubscriptions} />
          <Card title="Total Revenue" value={`$${totalRevenue}`} />
          <Card title="Turnover Rate" value={`${turnoverRate}%`} />
          <Card title="User Growth" value={`${userGrowth}%`} />
        </div>
        <div className="mt-4 w-2/3">
          <h2 className="text-xl font-semibold mb-4">Subscription Breakdown</h2>
          <Bar data={chartData} options={chartOptions}/>
        </div>
      </div>)
}
    </SidebarInset>
  );
};

export default Dashboard;
