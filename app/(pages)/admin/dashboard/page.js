"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/breadcumb";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import LoadingSpinner from "@/components/spinner";
import { ArrowUpRight, ArrowDownRight, Users, UserCheck, UserMinus, Wallet, TrendingUp, Percent } from "lucide-react";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Enhanced Card component with simplified color scheme
const EnhancedCard = ({ title, value, icon: Icon, trend = 0, previous = 0 }) => {
  const isPositiveTrend = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-xl bg-background border border-foreground/10 shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-foreground/5">
            <Icon className="h-6 w-6 text-foreground/70" />
          </div>
          {trend !== 0 && (
            <div className={`flex items-center ${isPositiveTrend ? 'text-emerald-500' : 'text-red-500'}`}>
              {isPositiveTrend ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <span className="text-sm ml-1">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm text-foreground/60">{title}</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{value}</h2>
          {previous !== 0 && (
            <p className="text-xs text-foreground/50">
              Previous: {previous}
            </p>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-foreground/5 to-foreground/20" />
    </motion.div>
  );
};

// Simplified chart configuration
const getChartConfig = (data) => ({
  data: {
    ...data,
    datasets: [{
      ...data.datasets[0],
      backgroundColor: [
        'rgb(0,0,0,0.8)',
        'rgb(0,0,0,0.6)',
        'rgb(0,0,0,0.4)'
      ],
      borderRadius: 8,
      borderWidth: 0,
      hoverOffset: 4,
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#000000',
        bodyColor: '#666666',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgb(0,0,0,0.1)',
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: 'rgb(0,0,0,0.6)',
        },
      },
      y: {
        grid: {
          color: 'rgb(0,0,0,0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgb(0,0,0,0.6)',
        },
        beginAtZero: true,
        stepSize: 1,
      },
    },
  },
});

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    activeClients: 0,
    inactiveClients: 0,
    totalClients: 0,
    activeSubscriptions: 0,
    subscriptionBreakdown: {},
    totalRevenue: 0,
    turnoverRate: 0,
    userGrowth: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [clientsResponse, plansResponse] = await Promise.all([
        axios.get("/api/employers"),
        axios.get("/api/subscriptionPlanMaster"),
      ]);

      const clientsData = clientsResponse.data.data;
      const plansData = plansResponse.data.data;

      // Calculate metrics
      const active = clientsData.filter((client) => client.status === "ACTIVE").length;
      const inactive = clientsData.filter((client) => client.status === "INACTIVE").length;
      
      // Calculate revenue
      const revenue = clientsData.reduce((sum, client) => {
        const plan = plansData.find(plan => plan._id === client.subscriptionPlan);
        return sum + (plan ? plan.subscriptionFee : 0);
      }, 0);

      // Calculate subscription breakdown
      const subscriptions = plansData.reduce((breakdown, plan) => {
        const count = clientsData.filter((client) => client.subscriptionPlan === plan._id).length;
        return { ...breakdown, [plan.planName]: count };
      }, {});

      setMetrics({
        activeClients: active,
        inactiveClients: inactive,
        totalClients: clientsData.length,
        activeSubscriptions: active,
        subscriptionBreakdown: subscriptions,
        totalRevenue: revenue,
        turnoverRate: ((inactive / clientsData.length) * 100).toFixed(2),
        userGrowth: 10, // Replace with actual calculation
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const refreshInterval = setInterval(fetchData, 300000);
    return () => clearInterval(refreshInterval);
  }, []);

  const chartData = {
    labels: Object.keys(metrics.subscriptionBreakdown),
    datasets: [
      {
        label: "Subscriptions",
        data: Object.values(metrics.subscriptionBreakdown),
      },
    ],
  };

  return (
    <>
      <Header heading="Dashboard" />
      <AnimatePresence>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-[calc(100vh-100px)]"
          >
            <LoadingSpinner />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 flex-col gap-6 p-6 bg-background"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <EnhancedCard
                title="Total Clients"
                value={metrics.totalClients}
                icon={Users}
                trend={metrics.userGrowth}
              />
              <EnhancedCard
                title="Active Clients"
                value={metrics.activeClients}
                icon={UserCheck}
              />
              <EnhancedCard
                title="Inactive Clients"
                value={metrics.inactiveClients}
                icon={UserMinus}
              />
              <EnhancedCard
                title="Total Revenue"
                value={`$${metrics.totalRevenue.toLocaleString()}`}
                icon={Wallet}
              />
              <EnhancedCard
                title="Active Subscriptions"
                value={metrics.activeSubscriptions}
                icon={TrendingUp}
              />
              <EnhancedCard
                title="Turnover Rate"
                value={`${metrics.turnoverRate}%`}
                icon={Percent}
                trend={-parseFloat(metrics.turnoverRate)}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-xl bg-background border border-foreground/10 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.05)]"
            >
              <h2 className="text-xl font-semibold mb-6 text-foreground">Subscription Breakdown</h2>
              <div className="h-[400px]">
                <Bar {...getChartConfig(chartData)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;