import React, { useState, useEffect, useRef } from "react";
import { LogIn, Coffee, LogOut, Clock } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Toaster, toast } from "sonner";

const AttendanceCard = ({
  icon: Icon,
  title,
  description,
  bgColor,
  textColor,
  onClick,
  hoverColor,
}) => (
  <Card
    className={`${bgColor} ${textColor} ${hoverColor} cursor-pointer border-transparent w-[200px] h-[150px]`}
    onClick={onClick}
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
  const [attendanceData, setAttendanceData] = useState({
    checkInTime: null,
    breakDuration: null,
    checkOutTime: null,
    totalWorkingHours: null,
    date: new Date().toLocaleDateString(),
  });

  const [employeeId, setEmployeeId] = useState("001-0002");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const timerRef = useRef(null);
  const breakTimerRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState(0); // Total elapsed working time in seconds
  const [breakTimeElapsed, setBreakTimeElapsed] = useState(0); // Break time elapsed in seconds

  const startTimeRef = useRef(null); // Store Check-in start time
  const breakStartTimeRef = useRef(null); // Store Break start time

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return null;
    return new Date(dateTime).toLocaleTimeString();
  };

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("attendanceData"));

    // If data is not found in local storage or the date doesn't match
    if (!savedData || savedData.date !== new Date().toLocaleDateString()) {
      // Make GET request to fetch data for today from your API
      console.log("YES")
      axios
        .get(`/api/users/attendance/${employeeId}`)
        .then((response) => {
          const { data } = response;
          console.log(data[0])
          if (data[0] && new Date(data[0].date).toLocaleDateString()=== new Date().toLocaleDateString()) {

            console.log("Parttttt")
            setAttendanceData({
              ...data[0],
              checkInTime: data[0].checkInTime ? new Date(data[0].checkInTime) : null,
              checkOutTime: data[0].checkOutTime
                ? new Date(data[0].checkOutTime)
                : null,
            });
            setElapsedTime(data[0].elapsedTime || 0);
            setBreakTimeElapsed(data[0].breakTimeElapsed || 0);
            setIsTimerRunning(!!data[0].checkInTime && !data[0].checkOutTime);
            setIsOnBreak(data[0].isOnBreak || false);
          }
        })
        .catch((error) => {
          console.error("Error fetching attendance data:", error);
        });
    } else {
      // Use saved data from local storage if it exists
      setAttendanceData({
        ...savedData,
        checkInTime: savedData.checkInTime
          ? new Date(savedData.checkInTime)
          : null,
        checkOutTime: savedData.checkOutTime
          ? new Date(savedData.checkOutTime)
          : null,
      });
      setElapsedTime(savedData.elapsedTime || 0);
      setBreakTimeElapsed(savedData.breakTimeElapsed || 0);
      setIsTimerRunning(!!savedData.checkInTime && !savedData.checkOutTime);
      setIsOnBreak(savedData.isOnBreak || false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "attendanceData",
      JSON.stringify({
        ...attendanceData,
        elapsedTime,
        breakTimeElapsed,
        isOnBreak,
      })
    );
  }, [attendanceData, elapsedTime, breakTimeElapsed, isOnBreak]);

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

  useEffect(() => {
    if (isOnBreak) {
      breakTimerRef.current = setInterval(() => {
        setBreakTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(breakTimerRef.current);
    }

    return () => clearInterval(breakTimerRef.current);
  }, [isOnBreak]);

  const handleAttendanceAction = async (action) => {
    try {
      if (action === "check-in" && !attendanceData.checkInTime) {
        toast.success("Welcome Abdullah");
        setIsTimerRunning(true);
        startTimeRef.current = Date.now();
        setAttendanceData((prev) => ({ ...prev, checkInTime: new Date() }));
      } else if (action === "break" && isTimerRunning) {
        if (!isOnBreak) {
          breakStartTimeRef.current = Date.now();
          setIsOnBreak(true);
          toast.info("Break started");
        } else {
          setIsOnBreak(false);
          toast.info("Break ended");
        }
      } else if (action === "check-out" && isTimerRunning && !isOnBreak) {
        setIsTimerRunning(false);
        const totalWorkTime = elapsedTime - breakTimeElapsed;

        const updatedData = {
          ...attendanceData,
          checkOutTime: new Date(),
          totalWorkingHours: formatTime(totalWorkTime),
        };

        setAttendanceData(updatedData);

        await axios.post(`/api/users/attendance/${employeeId}`, {
          checkInTime: attendanceData.checkInTime, // Adding the check-in time
          checkOutTime: new Date(),
          totalWorkingHours: formatTime(totalWorkTime),
          breakDuration: formatTime(breakTimeElapsed),
          date: new Date(),
        });

        toast.success("Check-out successful");
      }
    } catch (error) {
      toast.error("An error occurred while processing your action");
    }
  };

  return (
    <div className="mt-5 flex flex-col justify-center items-center">
      <Toaster richColors />
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">{new Date(attendanceData.date
        ).toLocaleDateString()}</h2>
        <p className="text-xl font-bold">
          Employee {employeeId}&apos;s Attendance
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 max-w-[850px]">
        <AttendanceCard
          icon={LogIn}
          title={
            attendanceData.checkInTime
              ? formatDateTime(attendanceData.checkInTime)
              : "Click to check in"
          }
          description="Check in"
          bgColor={attendanceData.checkInTime ? "bg-gray-500" : "bg-green-700"}
          hoverColor="hover:bg-green-900"
          textColor="text-white"
          onClick={() =>
            !attendanceData.checkInTime && handleAttendanceAction("check-in")
          }
        />
        <AttendanceCard
          icon={Coffee}
          title={isOnBreak ? formatTime(breakTimeElapsed) : "Break"}
          description="Break"
          bgColor={isOnBreak ? "bg-red-500" : "bg-red-700"}
          hoverColor="hover:bg-red-900"
          textColor="text-white"
          onClick={() => isTimerRunning && handleAttendanceAction("break")}
        />
        <AttendanceCard
          icon={LogOut}
          title={
            attendanceData.checkOutTime
              ? formatDateTime(attendanceData.checkOutTime)
              : "Click to check out"
          }
          description="Check out"
          bgColor={
            isTimerRunning && !isOnBreak ? "bg-yellow-700" : "bg-gray-500"
          }
          hoverColor="hover:bg-yellow-900"
          textColor="text-white"
          onClick={() =>
            isTimerRunning && !isOnBreak && handleAttendanceAction("check-out")
          }
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
