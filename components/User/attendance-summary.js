import React, { useState, useEffect, useRef } from "react";
import { LogIn, Coffee, LogOut, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

const AttendanceCard = ({ icon: Icon, title, description, bgColor, textColor, onClick, hoverColor }) => (
  <Card
    className={`${bgColor} ${textColor} ${hoverColor} cursor-pointer border-transparent w-[200px] h-[150px]`}
    onClick={onClick}
  >
    <CardHeader className="flex flex-col items-start h-full justify-center">
      <Icon size={24} />
      <CardTitle className="text-lg mt-2">{title}</CardTitle>
      <CardDescription className="text-white text-lg font-bold">{description}</CardDescription>
    </CardHeader>
  </Card>
);

const AttendanceSummary = () => {
  const [attendanceData, setAttendanceData] = useState({
    checkInTime: null,
    breakDuration: null,
    checkOutTime: null,
    totalWorkingHours:null,
    date: new Date().toLocaleDateString(),
  });

  const [employeeId, setEmployeeId] = useState("001-0001");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const timerRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState(0); // Total elapsed working time in seconds
  const [breakTimeElapsed, setBreakTimeElapsed] = useState(0); // Break time elapsed in seconds

  const startTimeRef = useRef(null); // Store Check-in start time
  const breakStartTimeRef = useRef(null); // Store Break start time

  // Function to format time as "hh:mm"
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Fetch Attendance Data from Server
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await axios.get(`/api/users/attendance/${employeeId}`);
        const data = response.data;

        // Parse and set state
        setAttendanceData({
          checkInTime: data.checkInTime ? new Date(data.checkInTime) : null,
          breakDuration: data.breakDuration ,
          checkOutTime: data.checkOutTime ? new Date(data.checkOutTime) : null,
          totalWorkingHours: data.totalWorkingHours,
          date: data.date || new Date().toLocaleDateString(),
        });

        // Restore timers from localStorage if available
        const savedElapsedTime = localStorage.getItem("elapsedTime");
        const savedBreakTime = localStorage.getItem("breakTimeElapsed");
        if (savedElapsedTime) setElapsedTime(parseInt(savedElapsedTime));
        if (savedBreakTime) setBreakTimeElapsed(parseInt(savedBreakTime));
      } catch (error) {
        console.error("Error fetching attendance data:", error.message);
      }
    };

    fetchAttendanceData();
  }, [employeeId]);

  // Save Timer States in LocalStorage
  useEffect(() => {
    localStorage.setItem("elapsedTime", elapsedTime);
    localStorage.setItem("breakTimeElapsed", breakTimeElapsed);
  }, [elapsedTime, breakTimeElapsed]);

  // Timer Logic
  useEffect(() => {
    if (isTimerRunning && !isOnBreak) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, isOnBreak]);

  // Handle Attendance Actions
  const handleAttendanceAction = async (action) => {
    if (action === "check-in" && !attendanceData.checkInTime) {
      setIsTimerRunning(true);
      startTimeRef.current = Date.now();
      setAttendanceData((prev) => ({ ...prev, checkInTime: new Date() }));

      await axios.post(`/api/users/attendance/${employeeId}`, {
        checkInTime: new Date(),
        date: new Date(),
      });
    } else if (action === "break" && isTimerRunning) {
      if (!isOnBreak) {
        breakStartTimeRef.current = Date.now();
        setIsOnBreak(true);
      } else {
        const breakDuration = Date.now() - breakStartTimeRef.current;
        setBreakTimeElapsed((prev) => prev + Math.floor(breakDuration / 1000));
        setIsOnBreak(false);
      }
    } else if (action === "check-out" && isTimerRunning && !isOnBreak) {
      setIsTimerRunning(false);
      const totalWorkTime = elapsedTime - breakTimeElapsed;

      setAttendanceData((prev) => ({
        ...prev,
        checkOutTime: new Date(),
        totalWorkingHours: formatTime(totalWorkTime),
      }));

      await axios.put(`/api/users/attendance/${employeeId}`, {
        checkOutTime: new Date(),
        totalWorkingHours: formatTime(totalWorkTime),
        breakDuration: formatTime(breakTimeElapsed),
        date: new Date(),
      });
    }
  };

  return (
    <div className="mt-5 flex flex-col justify-center items-center">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">{ new Date(attendanceData.date).toLocaleDateString()}</h2>
        <p className="text-xl font-bold">Employee {employeeId}'s Attendance</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 max-w-[850px]">
        <AttendanceCard
          icon={LogIn}
          title={
            attendanceData.checkInTime
              ? attendanceData.checkInTime.toLocaleTimeString()
              : "Click to check in"
          }
          description="Check in"
          bgColor="bg-green-700"
          hoverColor="hover:bg-green-900"
          textColor="text-white"
          onClick={() => handleAttendanceAction("check-in")}
        />
        <AttendanceCard
          icon={Coffee}
          title={isOnBreak ? "On Break" : formatTime(breakTimeElapsed)}
          description="Break"
          bgColor="bg-red-700"
          hoverColor="hover:bg-red-900"
          textColor="text-white"
          onClick={() => handleAttendanceAction("break")}
        />
        <AttendanceCard
          icon={LogOut}
          title={
            attendanceData.checkOutTime
              ? attendanceData.checkOutTime.toLocaleTimeString()
              : "Click to check out"
          }
          description="Check out"
          bgColor="bg-yellow-700"
          hoverColor="hover:bg-yellow-900"
          textColor="text-white"
          onClick={() => handleAttendanceAction("check-out")}
        />
        <AttendanceCard
          icon={Clock}
          title={attendanceData.totalWorkingHours || formatTime(elapsedTime)}
          description="Working hours"
          bgColor="bg-blue-800"
          hoverColor="hover:bg-blue-900"
          textColor="text-white"
        />
      </div>
    </div>
  );
};

export default AttendanceSummary;
