"use client";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import LoadingSpinner from "@/components/spinner";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from "@/components/breadcumb";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem } from "@/components/ui/select";

const LeaveManagement = () => {
  const { data: session } = useSession();
  const employeeId = session?.user?.username || "001-0001";

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [employeeLeaves, setEmployeeLeaves] = useState([]);
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveType, setLeaveType] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // const leavesResponse = await axios.get(`/api/employees/leaves`);
        const masterDataResponse = await axios.get(`/api/employees/single//${employeeId}`);

        console.log(masterDataResponse.data.data);

        const leavesResponse = await axios.get(`/api/employees/leave?employerId=${masterDataResponse.data.data.clientId}`);


        setEmployeeLeaves(masterDataResponse.data.data.leaves || []);
        setLeaveData(leavesResponse.data.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [employeeId]);

  const handleApplyLeave = async () => {
    if (!leaveReason || !leaveType) {
      alert("Please provide all details before applying for leave.");
      return;
    }

    try {
      await axios.post(`/api/leaves/apply`, {
        employeeId,
        leaveType,
        leaveReason,
      });
      alert("Leave applied successfully.");
      setLeaveReason("");
      setLeaveType("");
    } catch (error) {
      console.error("Error applying for leave:", error);
      alert("Failed to apply for leave. Please try again.");
    }
  };

  return (
    <>
      <Header heading="Leave Management" />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="transition-width duration-300 flex-1 p-6">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl">Leave Management</h1>
                <p>Available Leaves:</p>
              </div>

              <Table className="shadow-md rounded-lg border-separate">
                <TableHeader>
                  <TableRow className="bg-foreground text-left">
                    <TableHead className="px-4 py-2 font-semibold text-white">Leave ID</TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">Type</TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">Reason</TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">Start Date</TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">End Date</TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveData.map((leave) => (
                    <TableRow key={leave.id} className="bg-background shadow-lg rounded-lg border-separate">
                      <TableCell className="px-4">{leave.id}</TableCell>
                      <TableCell className="px-4">{leave.type}</TableCell>
                      <TableCell className="px-4">{leave.reason}</TableCell>
                      <TableCell className="px-4">{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                      <TableCell className="px-4">{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                      <TableCell className="px-4">{leave.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6">
                <h2 className="text-xl mb-4">Apply for Leave</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium">Leave Type</label>
                  <Select
                    onValueChange={(value) => setLeaveType(value)}
                    placeholder="Select leave type"
                    value={leaveType}
                  >
                    {employeeLeaves.map((leave) => (
                      <SelectItem
                        key={leave.leaveId}
                        value={leave.leaveId}
                      >
                        {`${leave.leaveId} (Available: ${leave.available})`}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium">Reason</label>
                  <Textarea
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Provide a reason for your leave"
                  />
                </div>

                <Button onClick={handleApplyLeave}>Apply Leave</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveManagement;
