
import React, { useState, useEffect } from "react";
import { LogIn, Coffee, LogOut, Clock } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { useSession } from "next-auth/react";
import LoadingSpinner from "../spinner";

const timeUtils = {
  calculateDuration: (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    return Math.floor((new Date(endTime) - new Date(startTime)) / (1000 * 60)); // Duration in minutes
  },

  calculateTotalBreakTime: (breaks) => {
    return breaks.reduce((total, breakPeriod) => {
      if (breakPeriod.breakIn && breakPeriod.breakOut) {
        return total + timeUtils.calculateDuration(breakPeriod.breakIn, breakPeriod.breakOut);
      }
      return total;
    }, 0);
  },

  formatDuration: (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  },

  formatTime: (date) => {
    if (!date) return null;
    return new Date(date).toLocaleTimeString();
  }
};

const AttendanceCard = ({
  icon: Icon,
  title,
  description,
  bgColor,
  textColor,
  onClick,
  hoverColor,
  disabled
}) => (
  <Card
    className={`${bgColor} ${textColor} ${!disabled && hoverColor} cursor-pointer border-transparent w-[200px] h-[150px] ${disabled ? 'opacity-50' : ''}`}
    onClick={!disabled ? onClick : undefined}
  >
    <CardHeader className="flex flex-col items-start h-full justify-center">
      <Icon size={24} />
      <CardTitle className="text-lg mt-2">{title}</CardTitle>
      <CardDescription className="text-white text-lg font-bold">
        {description}
      </CardDescription>
    </CardHeader>
  </Card>
);

const AttendanceSummary = () => {
  const { data: session } = useSession();
  const employeeId = session?.user?.username;
  const [loading, setLoading] = useState(true);

  const [state, setState] = useState({
    _id: null,
    employeeName: "",
    checkInTime: null,
    checkOutTime: null,
    breaks: [], // Array of {breakIn: Date, breakOut: Date}
    totalWorkingHours: null,
    isOnBreak: false,
    date: new Date().toLocaleDateString()
  });

  useEffect(() => {
    const loadData = async () => {
      if (!employeeId) return;

      try {
        setLoading(true);
        
        // First get employee name - separate try-catch to ensure we get the name even if attendance fails
        try {
          const employeeRes = await axios.get(`/api/employees/${employeeId}`);
          setState(prev => ({
            ...prev,
            employeeName: employeeRes.data.data
          }));
        } catch (error) {
          console.warn("Failed to fetch employee name:", error);
          toast.error("Error loading employee data");
        }

        // Then try to get attendance data
        try {
          const attendanceRes = await axios.get(`/api/users/attendance/${employeeId}`);
          const todayAttendance = attendanceRes.data[0];
          
          // Check if we have today's attendance
          if (todayAttendance && new Date(todayAttendance.date).toLocaleDateString() === new Date().toLocaleDateString()) {
            setState(prev => ({
              ...prev,
              ...todayAttendance,
              breaks: todayAttendance.breaks || []
            }));
          }
          // If no attendance found or not today's, we'll use the default state (which already has the employee name)
        } catch (error) {
          // If attendance data doesn't exist, we just continue with default state
          console.log("No attendance record found for today");
        }

      } catch (error) {
        console.warn("General error in loadData:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [employeeId]);

  const handleAttendanceAction = async (action) => {
    if (!employeeId) {
      toast.error("Please log in first");
      return;
    }

    try {
      switch (action) {
        case "check-in": {
          if (!state.checkInTime) {
            const attendanceData = {
              employeeId,
              checkInTime: new Date(),
              date: new Date(),
              breaks: []
            };

            const response = await axios.post(`/api/users/attendance/${employeeId}`, attendanceData);
            setState(prev => ({
              ...prev,
              ...attendanceData,
              _id: response.data._id
            }));
            toast.success(`Welcome ${state.employeeName}`);
          }
          break;
        }

        case "break": {
          const newBreaks = [...state.breaks];
          if (!state.isOnBreak) {
            // Start break
            newBreaks.push({ breakIn: new Date() });
            setState(prev => ({
              ...prev,
              breaks: newBreaks,
              isOnBreak: true
            }));

            await axios.put(`/api/users/attendance/${employeeId}`, {
              _id: state._id,
              breaks: newBreaks,
              isOnBreak: true

              });

            toast.info("Break started");
          } else {
            // End break
            const currentBreak = newBreaks[newBreaks.length - 1];
            currentBreak.breakOut = new Date();
            
            // Calculate total break time
            const totalBreakMinutes = timeUtils.calculateTotalBreakTime(newBreaks);
            
            await axios.put(`/api/users/attendance/${employeeId}`, {
              _id: state._id,
              breaks: newBreaks,
              isOnBreak: false,
              totalBreakDuration: timeUtils.formatDuration(totalBreakMinutes)
            });

            setState(prev => ({
              ...prev,
              breaks: newBreaks,
              isOnBreak: false
            }));
            toast.info("Break ended");
          }
          break;
        }

        case "check-out": {
          if (state.checkInTime && !state.checkOutTime && !state.isOnBreak) {
            const checkOutTime = new Date();
            const totalMinutes = timeUtils.calculateDuration(state.checkInTime, checkOutTime);
            const totalBreakMinutes = timeUtils.calculateTotalBreakTime(state.breaks);
            const actualWorkMinutes = totalMinutes - totalBreakMinutes;

            const finalData = { 
              _id: state._id,
              checkOutTime,
              totalWorkingHours: timeUtils.formatDuration(actualWorkMinutes),
              totalBreakDuration: timeUtils.formatDuration(totalBreakMinutes)
            };

            await axios.put(`/api/users/attendance/${employeeId}`, finalData);
            setState(prev => ({
              ...prev,
              ...finalData
            }));
            toast.success("Check-out successful");
          }
          break;
        }
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner/>
  }

  const currentBreak = state.breaks[state.breaks.length - 1];
  const totalBreakMinutes = timeUtils.calculateTotalBreakTime(state.breaks);
  const breakDisplay = state.isOnBreak 
    ? `On Break (${timeUtils.formatDuration(totalBreakMinutes)})`
    : `Breaks: ${timeUtils.formatDuration(totalBreakMinutes)}`;

  return (
    <div className="flex flex-col justify-center items-center">
      <Toaster richColors />
      <div className="bg-foreground p-4 w-full md:flex md:justify-between md:items-center">
        <h2 className="text-m text-white">
          Date: {new Date(state.date).toLocaleDateString()}
        </h2>
        <p className="text-lg font-semibold text-white">
          Welcome {state.employeeName}
        </p>
        <p className="text-m text-white">ID: {employeeId}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 max-w-[850px]">
        <AttendanceCard
          icon={LogIn}
          title={state.checkInTime ? timeUtils.formatTime(state.checkInTime) : "Click to check in"}
          description="Check in"
          bgColor={state.checkInTime ? "bg-gray-500" : "bg-green-700"}
          hoverColor="hover:bg-green-900"
          textColor="text-white"
          onClick={() => handleAttendanceAction("check-in")}
          disabled={!!state.checkInTime}
        />
        <AttendanceCard
          icon={Coffee}
          title={breakDisplay}
          description="Break"
          bgColor={state.isOnBreak ? "bg-red-500" : "bg-red-700"}
          hoverColor="hover:bg-red-900"
          textColor="text-white"
          onClick={() => handleAttendanceAction("break")}
          disabled={!state.checkInTime || !!state.checkOutTime}
        />
        <AttendanceCard
          icon={LogOut}
          title={state.checkOutTime ? timeUtils.formatTime(state.checkOutTime) : "Click to check out"}
          description="Check out"
          bgColor={state.checkInTime && !state.checkOutTime && !state.isOnBreak ? "bg-yellow-700" : "bg-gray-500"}
          hoverColor="hover:bg-yellow-900"
          textColor="text-white"
          onClick={() => handleAttendanceAction("check-out")}
          disabled={!state.checkInTime || !!state.checkOutTime || state.isOnBreak}
        />
        <AttendanceCard
          icon={Clock}
          title={state.totalWorkingHours || "Not checked out"}
          description="Working hours"
          bgColor="bg-blue-800"
          hoverColor="hover:bg-blue-900"
          textColor="text-white"
          disabled={true}
        />
      </div>
    </div>
  );
};

export default AttendanceSummary;
