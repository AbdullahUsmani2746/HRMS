"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/spinner";
import {
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableHeader,
} from "@/components/ui/table"; // Replace with your ShadCN components
import Header from "@/components/breadcumb";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

export default function PayrollProcessPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchPayrollProcesses();
  }, []);

  const fetchPayrollProcesses = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/api/payroll/payroll-process");
      setPayrolls(data.data || []);
    } catch (error) {
      console.error("Failed to fetch payroll processes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePayrollDetails = (dateFrom, dateTo) => {
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    const weekNo = Math.ceil((startDate.getDate() + startDate.getDay()) / 7);
    const monthNo = startDate.getMonth() + 1; // Months are 0-indexed
    const year = startDate.getFullYear();

    return { weekNo, monthNo, year };
  };

  const isDateRangeOverlapping = (newStart, newEnd) => {
    const newStartDate = new Date(newStart);
    const newEndDate = new Date(newEnd);

    return payrolls.some(({ date_from, date_to }) => {
      const existingStart = new Date(date_from);
      const existingEnd = new Date(date_to);
      return (
        (newStartDate >= existingStart && newStartDate <= existingEnd) ||
        (newEndDate >= existingStart && newEndDate <= existingEnd) ||
        (newStartDate <= existingStart && newEndDate >= existingEnd)
      );
    });
  };

  const generatePayroll = async () => {
    if (!dateFrom || !dateTo) {
      alert("Please provide both 'Date From' and 'Date To'.");
      return;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      alert("'Date From' cannot be later than 'Date To'.");
      return;
    }

    if (isDateRangeOverlapping(dateFrom, dateTo)) {
      alert("The provided date range overlaps with an existing payroll.");
      return;
    }

    const { weekNo, monthNo, year } = calculatePayrollDetails(dateFrom, dateTo);

    setIsLoading(true);
    try {
      const { data } = await axios.post("/api/payroll/payroll-process", {
        date_from: dateFrom,
        date_to: dateTo,
        employerId: "CLIENT-001",
      });
      if (data.success) {
        alert("Payroll process generated successfully!");
        fetchPayrollProcesses(); // Refresh the list
        setDateFrom("");
        setDateTo("");
      } else {
        alert("Failed to generate payroll process.");
      }
    } catch (error) {
      console.error("Error generating payroll process:", error);
      alert("Error generating payroll process.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header heading="Payroll Process" />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="transition-width duration-300 flex-1 p-6">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl">Payroll Process</h1>
              </div>
              <div className="flex gap-4 justify-between items-end">
              <div className="flex gap-4">
                <div className="mb-6">
                  <label className="block mb-2 font-semibold">Date From:</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full"
                  />
                </div>
                <div className="mb-6">
                  <label className="block mb-2 font-semibold">Date To:</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full"
                  />
                </div>
              </div>

              <Button onClick={generatePayroll} className="mb-4">
                {isLoading ? "Processing...." : "Generate Payroll"}
              </Button>
              </div>

              <Table className="shadow-md rounded-lg border-separate">
                <TableHeader>
                  <TableRow className="bg-foreground text-left">
                    <TableHead className="px-4 py-2 font-semibold text-white">
                      Payroll ID
                    </TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">
                      Date From
                    </TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">
                      Date To
                    </TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">
                      Month No
                    </TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">
                      Week No
                    </TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">
                      Year
                    </TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">
                      Employer ID
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.map((payroll) => (
                    <TableRow
                      key={payroll._id}
                      className="bg-background shadow-lg rounded-lg border-separate"
                    >
                      <TableCell className="px-4">
                        {payroll.payroll_id}
                      </TableCell>
                      <TableCell className="px-4">
                        {format(new Date(payroll.date_from), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell className="px-4">
                        {format(new Date(payroll.date_to), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell className="px-4">{payroll.month_no}</TableCell>
                      <TableCell className="px-4">{payroll.week_no}</TableCell>
                      <TableCell className="px-4">{payroll.year}</TableCell>
                      <TableCell className="px-4">
                        {payroll.employerId}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
