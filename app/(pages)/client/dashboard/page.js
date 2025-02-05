"use client"
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PieChart, Pie, Cell, Legend, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, LineChart, 
  Line, ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Users, DollarSign, Calculator, TrendingUp,
  Building, Wallet, CreditCard, Receipt 
} from "lucide-react";
import Header from "@/components/breadcumb";

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [activeTab, setActiveTab] = useState("overview");

  // Enhanced payroll deductions data
  const payrollDeductions = {
    paye: [
      { grade: "Grade 1", basic: 45000, housing: 15000, transport: 10000, tax: 12500 },
      { grade: "Grade 2", basic: 65000, housing: 20000, transport: 15000, tax: 18500 },
      { grade: "Grade 3", basic: 85000, housing: 25000, transport: 20000, tax: 24500 },
    ],
    npf: [
      { grade: "Grade 1", employee: 4500, employer: 4500, total: 9000 },
      { grade: "Grade 2", employee: 6500, employer: 6500, total: 13000 },
      { grade: "Grade 3", employee: 8500, employer: 8500, total: 17000 },
    ],
    acc: [
      { month: "January", claims: 12, amount: 45000 },
      { month: "February", claims: 8, amount: 32000 },
      { month: "March", claims: 15, amount: 58000 },
    ]
  };

  const expenseData = [
    { category: "Salaries", amount: 450000, percentage: 45 },
    { category: "Benefits", amount: 200000, percentage: 20 },
    { category: "Insurance", amount: 150000, percentage: 15 },
    { category: "Training", amount: 120000, percentage: 12 },
    { category: "Others", amount: 80000, percentage: 8 },
  ];

  const COLORS = {
    primary: ["#0ea5e9", "#0284c7", "#0369a1"],
    secondary: ["#14b8a6", "#0d9488", "#0f766e"],
    accent: ["#f59e0b", "#d97706", "#b45309"],
    neutral: ["#6b7280", "#4b5563", "#374151"]
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: { 
      scale: 1.02,
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      transition: { duration: 0.2 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <>
    <Header heading="Dashboard"/>
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-6 space-y-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-8"
        >
          {/* Overview Section */}
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Dynamic Stats Cards */}
                  {[
                    { icon: DollarSign, title: "Total Payroll", value: "$1.2M", change: "+5.2%" },
                    { icon: Users, title: "Active Employees", value: "328", change: "+3.1%" },
                    { icon: Calculator, title: "Avg. Deductions", value: "$2,420", change: "-2.3%" },
                    { icon: Wallet, title: "Net Payments", value: "$980K", change: "+4.8%" }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      variants={cardVariants}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                          <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{stat.value}</span>
                            <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                              {stat.change}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Deductions Section */}
          <Tabs defaultValue="paye" className="space-y-6">
            <TabsList className="bg-blue-50 dark:bg-gray-800/50 p-1 rounded-lg">
              <TabsTrigger value="paye" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                PAYE Analysis
              </TabsTrigger>
              <TabsTrigger value="npf" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                NPF Contributions
              </TabsTrigger>
              <TabsTrigger value="acc" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                ACC Claims
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* PAYE Analysis */}
                  <TabsContent value="paye" className="mt-0">
                    <Card className="border-none shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Receipt className="h-5 w-5 text-blue-500" />
                          PAYE Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={payrollDeductions.paye}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="grade" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="basic" fill={COLORS.primary[0]} />
                            <Bar dataKey="housing" fill={COLORS.primary[1]} />
                            <Bar dataKey="transport" fill={COLORS.primary[2]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* NPF Analysis */}
                  <TabsContent value="npf" className="mt-0">
                    <Card className="border-none shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="h-5 w-5 text-blue-500" />
                          NPF Contributions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={payrollDeductions.npf}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="grade" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="employee" fill={COLORS.secondary[0]} />
                            <Bar dataKey="employer" fill={COLORS.secondary[1]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ACC Analysis */}
                  <TabsContent value="acc" className="mt-0">
                    <Card className="border-none shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-blue-500" />
                          ACC Claims History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={payrollDeductions.acc}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="amount" 
                              stroke={COLORS.accent[0]}
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </motion.div>
            </AnimatePresence>
          </Tabs>

          {/* Expenses Distribution */}
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-500" />
                  Expenses Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="percentage"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={Object.values(COLORS).flat()[index]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-4">
                    {expenseData.map((item, index) => (
                      <motion.div
                        key={item.category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <span className="font-medium">{item.category}</span>
                        <span className="text-lg font-bold">
                          ${item.amount.toLocaleString()}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;