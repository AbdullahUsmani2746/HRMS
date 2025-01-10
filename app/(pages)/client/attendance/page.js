"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import axios from "axios";
import LoadingSpinner from "@/components/spinner";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import Header from "@/components/breadcumb";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";


// DatePickerWithRange Component
const DateRangePicker = ({ selectedRange, onRangeChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="justify-start">
          {selectedRange?.from && selectedRange?.to ? (
            <>
              {format(new Date(selectedRange.from), "yyyy-MM-dd")} -{" "}
              {format(new Date(selectedRange.to), "yyyy-MM-dd")}
            </>
          ) : (
            "Pick a date range"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={selectedRange}
          onSelect={(range) => {
            onRangeChange(range);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

// Approvals Component
const PeriodicAttendanceComponent = () => {

  const router = useRouter();
  const{data: session}= useSession();
  const employerId = session.user.username;

  const [newAttendance, setNewAttendance] = useState({
    employeeId: "001-0002",
    dateRange: undefined,
    hoursWorked: "",
    breakHours: "",
    leaves: 0,
    status: "Pending",
  });
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state
  const [ModalOpen, setModalOpen] = useState(false);
  const[employeeName, setEmployeeName] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  const closeModal = async () => {
    setModalOpen(false);
  };
  const openModal = () => {
    setModalOpen(true);
  };

  const handleFetchAttendance = async () => {
    // const { from, to } = newAttendance.dateRange;

    try {
      setIsLoading(true);
      const employee_name = await axios.get(`/api/employees/001-0002`);
      const response = await axios.get(`/api/employees/periodicAttendance?employerId=${employerId}`, {
        // params: {
        //   employeeId: newAttendance.employeeId,
        //   startDate: from,
        //   endDate: to,
        // },
      });
      console.log(employee_name.data.data);
      setEmployeeName(employee_name.data.data);
      console.log("Attendance data fetched successfully:", response.data);
      setAttendanceData(response.data.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // if (newAttendance.dateRange?.from && newAttendance.dateRange?.to) {
      handleFetchAttendance();
    // }
  }, []);
  

  const handleAddAttendance = async () => {
    if (!newAttendance.dateRange || !newAttendance.hoursWorked || !newAttendance.breakHours) {
      console.error("Please fill in all required fields.");
      return;
    }
  
    try {
      const { from, to } = newAttendance.dateRange;
  
      // Format the date range as "1 Dec to 29 Dec"
      const formattedDateRange = `${format(new Date(from), "d MMM")} to ${format(new Date(to), "d MMM")}`;
  
      // Prepare the payload
      const attendancePayload = {
        employeeId: newAttendance.employeeId,
        clientId:employerId,
        dateRange: formattedDateRange,
        totalWorkingHours: newAttendance.hoursWorked,
        totalBreakHours: newAttendance.breakHours,
        leaves: newAttendance.leaves,
        status: newAttendance.status,

      };
  
      // Send data to the API
      const response = await axios.post(`/api/employees/periodicAttendance`, attendancePayload);
  
      console.log("Attendance added successfully:", response.data);
  
      // Optional: Fetch updated attendance data
      handleFetchAttendance();
  
      // Close modal and reset form
      closeModal();
      setNewAttendance({
        employeeId: "001-0002",
        dateRange: undefined,
        totalWorkingHours: "",
        totalBreakHours: "",
        leaves: 0,
        status: "Pending",
      });
    } catch (error) {
      console.error("Error adding attendance:", error);
    }
  };
  

//   const generateAttendanceData = (range, data) => {
//     const dates = getDatesInRange(range.from, range.to);
//     return dates.map((date) => ({
//       ...data,
//       date,
//     }));
//   };

  const getDatesInRange = (start, end) => {
    const dates = [];
    let currentDate = new Date(start);
    while (currentDate <= new Date(end)) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  return (
    <>
     <Header heading="Periodic Attendance" />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="transition-width duration-300 flex-1 p-6">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl">Periodic Attendances</h1>
                <Button onClick={() => openModal()}>
                  Add Attendance Entry
                </Button>
              </div>

              <Table className="shadow-md rounded-lg border-separate">
                <TableHeader>
                  <TableRow className="bg-foreground text-left">
                    <TableHead className="px-4 py-2 font-semibold text-white">
                      ID
                    </TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">
                      Name
                    </TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">
                      Date from - Date to
                    </TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">
                      Total Working hours
                    </TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">
                      Total break Hours
                    </TableHead>

                    <TableHead className="px-4 py-2 font-semibold text-white">
                        Leaves
                    </TableHead>

                    <TableHead className="px-4 py-2 font-semibold text-white">
                        Status
                    </TableHead>
                   
                  </TableRow>
                </TableHeader>
                <TableBody >
                  {attendanceData!=[] && attendanceData.map((record) => (
                    <TableRow key={record._id} className="bg-background shadow-lg rounded-lg border-separate">
                      <TableCell  className="px-4">{record.employeeId}</TableCell>
                      <TableCell  className="px-4">{employeeName}</TableCell>
                      <TableCell  className="px-4">{record.dateRange}</TableCell>
                      <TableCell  className="px-4">{record.totalWorkingHours}</TableCell>
                      <TableCell  className="px-4">{record.totalBreakHours}</TableCell>
                      <TableCell  className="px-4">{record.leaves}</TableCell>
                      <TableCell  className="px-4">{record.status}</TableCell>


                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Add Attendance Modal */}
              {ModalOpen && (
                <Modal onClose={closeModal}>
                  <h2 className="text-xl font-semibold mb-4">Add Attendance</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Employee ID */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="employeeId"
                      >
                        Employee ID
                      </label>
                      <Input
                        id="employeeId"
                        placeholder="Enter Employee ID"
                        value={newAttendance.employeeId}
                        onChange={(e) =>
                          setNewAttendance({
                            ...newAttendance,
                            employeeId: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Date Range */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="dateRangePicker"
                      >
                        Date Range
                      </label>
                      <DateRangePicker
                        selectedRange={newAttendance.dateRange}
                        onRangeChange={(range) =>
                          setNewAttendance({
                            ...newAttendance,
                            dateRange: range,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="hoursWorked"
                      >
                        Total Hours Worked
                      </label>
                      <Input
                        id="hoursWorked"
                        type="number"
                        placeholder="Enter Hours Worked"
                        value={newAttendance.hoursWorked}
                        onChange={(e) =>
                          setNewAttendance({
                            ...newAttendance,
                            hoursWorked: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="breakHours"
                      >
                        Total Break Hours
                      </label>
                      <Input
                        id="breakHours"
                        type="number"
                        placeholder="Enter Break Hours"
                        value={newAttendance.breakHours}
                        onChange={(e) =>
                          setNewAttendance({
                            ...newAttendance,
                            breakHours: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="leaves"
                      >
                        Total Leaves
                      </label>
                      <Input
                        id="leaves"
                        type="number"
                        placeholder="Enter Leaves"
                        value={newAttendance.leaves}
                        onChange={(e) =>
                          setNewAttendance({
                            ...newAttendance,
                            leaves: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-6 text-right">
                    <Button
                      onClick={handleAddAttendance}
                      className="bg-primary text-white"
                    >
                      Submit
                    </Button>
                  </div>
                </Modal>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PeriodicAttendanceComponent;
