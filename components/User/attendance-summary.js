
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { useSession } from "next-auth/react";
import { LogIn, Coffee, LogOut, Clock, Calendar, Bell, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const AttendanceCard = ({ icon: Icon, title, description, bgColor, onClick, disabled, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <motion.div
      whileHover={!disabled ? {
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      <Card
        className={`${bgColor} relative overflow-hidden cursor-pointer border-none shadow-lg h-[180px] ${
          disabled ? "opacity-50" : "hover:shadow-xl"
        }`}
        onClick={!disabled ? onClick : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
        <div className="absolute -right-4 -top-4 w-24 h-24 blur-3xl bg-white/20 rounded-full" />
        
        <CardHeader className="flex flex-col items-start h-full justify-center relative z-10 p-6">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white/10 p-2 rounded-lg"
          >
            <Icon size={24} className="text-white" />
          </motion.div>
          
          <CardTitle className="text-lg mt-4 text-white font-bold">
            {title}
          </CardTitle>
          <CardDescription className="text-white/90 text-base font-medium mt-1">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  </motion.div>
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
    return <LoadingSpinner 
    variant="pulse"
    size="large"
    text="Processing..."
    fullscreen={true}
  />    
  }

  const currentBreak = state.breaks[state.breaks.length - 1];
  const totalBreakMinutes = timeUtils.calculateTotalBreakTime(state.breaks);
  const breakDisplay = state.isOnBreak 
    ? `On Break (${timeUtils.formatDuration(totalBreakMinutes)})`
    : `Breaks: ${timeUtils.formatDuration(totalBreakMinutes)}`;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background"
      >
        <Toaster richColors position="top-right" />
        
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-primary/5 backdrop-blur-lg border-b border-primary/10"
        >
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Calendar className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-left">
                    {new Date(state.date).toLocaleDateString()}
                  </h2>
                  <p className="text-muted-foreground">Employee ID: {employeeId}</p>
                </div>
              </motion.div>
  
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-6"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full bg-primary/10 cursor-pointer"
                >
                  <Bell size={20} className="text-primary" />
                </motion.div>
  
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Welcome back,</p>
                    <p className="font-semibold text-primary">{state.employeeName}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
  
        <div className="max-w-7xl mx-auto p-6 pt-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <AttendanceCard
              index={0}
              icon={LogIn}
              title={state.checkInTime ? timeUtils.formatTime(state.checkInTime) : "Start your day"}
              description="Check in"
              bgColor="bg-gradient-to-br from-emerald-600 to-emerald-800"
              onClick={() => handleAttendanceAction("check-in")}
              disabled={!!state.checkInTime}
            />
            
            <AttendanceCard
              index={1}
              icon={Coffee}
              title={breakDisplay}
              description={state.isOnBreak ? "End Break" : "Take a Break"}
              bgColor="bg-gradient-to-br from-amber-600 to-amber-800"
              onClick={() => handleAttendanceAction("break")}
              disabled={!state.checkInTime || !!state.checkOutTime}
            />
            
            <AttendanceCard
              index={2}
              icon={LogOut}
              title={state.checkOutTime ? timeUtils.formatTime(state.checkOutTime) : "End your day"}
              description="Check out"
              bgColor="bg-gradient-to-br from-rose-600 to-rose-800"
              onClick={() => handleAttendanceAction("check-out")}
              disabled={!state.checkInTime || !!state.checkOutTime || state.isOnBreak}
            />
            
            <AttendanceCard
              index={3}
              icon={Clock}
              title={state.totalWorkingHours || "Not checked out"}
              description="Working hours"
              bgColor="bg-gradient-to-br from-blue-600 to-blue-800"
              disabled={true}
            />
          </motion.div>
        </div>
      </motion.div>
    );
  };
  

export default AttendanceSummary;
