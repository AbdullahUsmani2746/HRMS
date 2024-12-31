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
import AttendanceSummary from "@/components/User/attendance-summary";
import Header from "@/components/breadcumb";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

 


  return (
    <>
      <Header heading="Dashboard" />
      {isLoading ? (<LoadingSpinner/>):
      (
        <div className="text-center"><AttendanceSummary/></div>
      )
}
    </>
  );
};

export default Dashboard;
