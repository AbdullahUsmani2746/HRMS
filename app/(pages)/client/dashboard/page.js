"use client";

import React, { useState, useEffect } from "react";
// import Card from "@/components/ui/Card-manual";

import axios from "axios";

import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";


import LoadingSpinner from "@/components/spinner";
import Header from "@/components/breadcumb";



const Dashboard = () => {

  const [isLoading, setIsLoading] = useState(false);
// Sample data
const pieData = [
  { name: "Item 1", value: 20 },
  { name: "Item 2", value: 20 },
  { name: "Item 3", value: 20 },
  { name: "Item 4", value: 20 },
  { name: "Item 5", value: 20 },
];

const barData = [
  { name: "Item 1", Series1: 20, Series2: 40, Series3: 60 },
  { name: "Item 2", Series1: 30, Series2: 50, Series3: 70 },
  { name: "Item 3", Series1: 40, Series2: 60, Series3: 80 },
  { name: "Item 4", Series1: 50, Series2: 70, Series3: 90 },
];

const simpleBarData = [
  { name: "Item 1", Series1: 10, Series2: 15 },
  { name: "Item 2", Series1: 15, Series2: 20 },
  { name: "Item 3", Series1: 20, Series2: 25 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
 


  return (
    <>
      <Header heading="Dashboard" />
      {isLoading ? (<LoadingSpinner/>):
      (
        <div className="p-6 grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className="p-4 border rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Expenses</h3>
          <PieChart width={400} height={250}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </div>
  
        {/* Bar Chart (PAYE) */}
        <div className="p-4 border rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">PAYE</h3>
          <BarChart width={400} height={250} data={barData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Series1" fill="#FF8042" />
            <Bar dataKey="Series2" fill="#8884D8" />
            <Bar dataKey="Series3" fill="#82CA9D" />
          </BarChart>
        </div>
  
        {/* Bar Chart (NPF) */}
        <div className="p-4 border rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">NPF</h3>
          <BarChart width={400} height={250} data={simpleBarData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Series1" fill="#FF8042" />
            <Bar dataKey="Series2" fill="#8884D8" />
          </BarChart>
        </div>
  
        {/* Bar Chart (ACC) */}
        <div className="p-4 border rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">ACC</h3>
          <BarChart width={400} height={250} data={simpleBarData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Series1" fill="#FF8042" />
            <Bar dataKey="Series2" fill="#8884D8" />
          </BarChart>
        </div>
      </div>

      )
}
    </>
  );
};

export default Dashboard;
