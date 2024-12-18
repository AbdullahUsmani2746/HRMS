"use client";

import React, { useState } from "react";
import axios from "axios";
import CardManual from "@/components/ui/Card-manual";
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
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // ShadCN UI components

import LoadingSpinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const AttendancePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    employeeId: "",
    employeeName: "",
    employerId: "EMP001", // Replace with actual employer ID if dynamic
    startTime: null,
    breakStartTime: null,
    breakEndTime: null,
    endTime: null,
    leave: "",
    publicHoliday: false,
    status: "Pending",
  });

  // Function to update specific times
  const updateTime = async (field) => {
    const updatedTime = new Date().toISOString();

    try {
      setIsLoading(true);
      const response = await axios.post("/api/attendance/log", {
        field,
        value: updatedTime,
        employeeId: attendanceData.employeeId,
      });

      if (response.status === 200) {
        setAttendanceData((prev) => ({
          ...prev,
          [field]: updatedTime,
        }));
        toast.success(`${field} recorded successfully!`);
      }
    } catch (error) {
      toast.error("Error recording time. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle full attendance submission
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/attendance", attendanceData);

      if (response.status === 200) {
        toast.success("Attendance Marked Successfully!");
      }
    } catch (error) {
      toast.error("Error submitting attendance. Try again!");
    } finally {
      setIsLoading(false);
    }
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
                <BreadcrumbLink href="#">HR Management Software</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Daily Attendance</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        // <div className="w-[80vw] mx-auto mt-10 p-5 rounded-lg">
        //   <h1 className="text-xl font-bold mb-4">Daily Attendance Marking</h1>

        //   <div className="space-y-4">
        //     {/* Employee ID */}
        //     <div>
        //       <Label>Employee ID</Label>
        //       <Input
        //         value={attendanceData.employeeId}
        //         onChange={(e) =>
        //           setAttendanceData({
        //             ...attendanceData,
        //             employeeId: e.target.value,
        //           })
        //         }
        //       />
        //     </div>
        //     {/* Employee Name */}
        //     <div>
        //       <Label>Employee Name</Label>
        //       <Input
        //         value={attendanceData.employeeName}
        //         onChange={(e) =>
        //           setAttendanceData({
        //             ...attendanceData,
        //             employeeName: e.target.value,
        //           })
        //         }
        //       />
        //     </div>

        //     {/* Start Time */}
        //     <div className="flex items-center space-x-4">
        //       <Button
        //         onClick={() => updateTime("startTime")}
        //         disabled={attendanceData.startTime}
        //       >
        //         Start Work
        //       </Button>
        //       {attendanceData.startTime && (
        //         <span>Started: {new Date(attendanceData.startTime).toLocaleTimeString()}</span>
        //       )}
        //     </div>

        //     {/* Break Start */}
        //     <div className="flex items-center space-x-4">
        //       <Button
        //         onClick={() => updateTime("breakStartTime")}
        //         disabled={!attendanceData.startTime || attendanceData.breakStartTime}
        //       >
        //         Start Break
        //       </Button>
        //       {attendanceData.breakStartTime && (
        //         <span>Break Started: {new Date(attendanceData.breakStartTime).toLocaleTimeString()}</span>
        //       )}
        //     </div>

        //     {/* Break End */}
        //     <div className="flex items-center space-x-4">
        //       <Button
        //         onClick={() => updateTime("breakEndTime")}
        //         disabled={!attendanceData.breakStartTime || attendanceData.breakEndTime}
        //       >
        //         End Break
        //       </Button>
        //       {attendanceData.breakEndTime && (
        //         <span>Break Ended: {new Date(attendanceData.breakEndTime).toLocaleTimeString()}</span>
        //       )}
        //     </div>

        //     {/* End Time */}
        //     <div className="flex items-center space-x-4">
        //       <Button
        //         onClick={() => updateTime("endTime")}
        //         disabled={!attendanceData.breakEndTime || attendanceData.endTime}
        //       >
        //         End Work
        //       </Button>
        //       {attendanceData.endTime && (
        //         <span>Work Ended: {new Date(attendanceData.endTime).toLocaleTimeString()}</span>
        //       )}
        //     </div>

        //     {/* Public Holiday */}
        //     {/* <div className="flex items-center space-x-2">
        //       <Checkbox
        //         checked={attendanceData.publicHoliday}
        //         onCheckedChange={() =>
        //           setAttendanceData((prev) => ({
        //             ...prev,
        //             publicHoliday: !prev.publicHoliday,
        //           }))
        //         }
        //       />
        //       <Label>Public Holiday</Label>
        //     </div> */}

        //     {/* Leave Dropdown */}
        //     {/* <div>
        //       <Label>Leave</Label>
        //       <select
        //         className="border p-2 rounded w-full"
        //         value={attendanceData.leave}
        //         onChange={(e) =>
        //           setAttendanceData({
        //             ...attendanceData,
        //             leave: e.target.value,
        //           })
        //         }
        //       >
        //         <option value="">Select Leave Type</option>
        //         <option value="Sick">Sick</option>
        //         <option value="Casual">Casual</option>
        //         <option value="Annual">Annual</option>
        //       </select>
        //     </div> */}

        //     {/* Submit Button */}
        //     <Button onClick={handleSubmit} className="w-full">
        //       Submit Attendance
        //     </Button>
        //   </div>
        // </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        {/* Check-in Card */}
        <Card className="bg-green-100 text-green-800">
          <CardHeader className="flex flex-col items-start">
            <ArrowRight size={24} />
            <CardTitle className="text-lg mt-2">11:30 AM</CardTitle>
            <CardDescription>Check in</CardDescription>
          </CardHeader>
        </Card>
  
        {/* Break Card */}
        <Card className="bg-rose-50 text-rose-700">
          <CardHeader className="flex flex-col items-start">
            <Coffee size={24} />
            <CardTitle className="text-lg mt-2">01h 45m</CardTitle>
            <CardDescription>Break</CardDescription>
          </CardHeader>
        </Card>
  
        {/* Check-out Card */}
        <Card className="bg-yellow-50 text-yellow-700">
          <CardHeader className="flex flex-col items-start">
            <LogOut size={24} />
            <CardTitle className="text-lg mt-2">08:00 PM</CardTitle>
            <CardDescription>Check out</CardDescription>
          </CardHeader>
        </Card>
  
        {/* Working Hours Card */}
        <Card className="bg-blue-50 text-blue-700">
          <CardHeader className="flex flex-col items-start">
            <Clock size={24} />
            <CardTitle className="text-lg mt-2">08h 30m</CardTitle>
            <CardDescription>Working hours</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

        
    </SidebarInset>
  );
};

export default AttendancePage;
