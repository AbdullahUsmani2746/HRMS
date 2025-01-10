"use client";

import React, { useState, useEffect } from "react";
// import Card from "@/components/ui/Card-manual";

import axios from "axios";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, UserPlus, Clock, FileText, Mail, Calendar1Icon } from "lucide-react";
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
import CalImage from "@/public/uploads/images/cal-image.png";
import Image from "next/image";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Overview = () => {
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
      <Header heading="Overview" />
      {isLoading ? (<LoadingSpinner/>):
      (
        <div className="p-6 grid gap-6 grid-cols-1 lg:grid-cols-3">
      {/* Payday Card */}
      <Card className="col-span-1 lg:col-span-2 flex justify-between items-center p-4">
        <CardContent>
          <CardTitle className="text-2xl font-bold">10 days until payday</CardTitle>
        </CardContent>
        <Image
          src={CalImage.src} // Replace with your image path
          width={250}
          height={250}
          alt="Calendar Illustration"
          // className="w-32"
        />
        {/* <Calendar1Icon className="w-64 h-64" /> */}
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Plus className="text-orange-500" />
            <span>Add Time Entry</span>
          </div>
          <div className="flex items-center space-x-3">
            <UserPlus className="text-orange-500" />
            <span>Add Employee</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="text-orange-500" />
            <span>Approve Time</span>
          </div>
          <div className="flex items-center space-x-3">
            <FileText className="text-orange-500" />
            <span>Run Report</span>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="text-orange-500" />
            <span>Invite Team</span>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card className="col-span-1 lg:col-span-2 p-4">
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {Array(4)
              .fill("")
              .map((_, i) => (
                <li key={i} className="flex items-center space-x-3">
                  <input type="checkbox" className="w-5 h-5 border rounded" />
                  <span>Task {i + 1}</span>
                </li>
              ))}
          </ul>
          <div className="flex mt-4 space-x-3">
            <button className="text-xl">+</button>
            <button className="text-xl">✏️</button>
          </div>
        </CardContent>
      </Card>

      {/* Helpful Resources */}
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Helpful Resources</CardTitle>
        </CardHeader>
      </Card>
    </div>

      )
}
    </>
  );
};

export default Overview;
