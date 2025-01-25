// pages/payslip.js
"use client";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/spinner";
import Header from "@/components/breadcumb";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Payslip = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "001-0001";

  const [isLoading, setIsLoading] = useState(false);
  const [payslips, setPayslips] = useState([]);

  useEffect(() => {
    const fetchPayslips = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/payroll/payslip/${employerId}`);
        setPayslips(response.data);
      } catch (error) {
        console.error("Error fetching payslips:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayslips();
  }, [employerId]);

  return (
    <>
      <Header heading="Payslip History" />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="transition-width duration-300 flex-1 p-6">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl">Payslip History</h1>
              </div>

              <Table className="shadow-md rounded-lg border-separate">
                <TableHeader>
                  <TableRow className="bg-foreground text-left">
                    <TableHead className="px-4 py-2 font-semibold text-white">ID</TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">Week</TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">Month</TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">Year</TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">Net Salary</TableHead>
                    {/* <TableHead className="px-4 py-2 font-semibold text-white">Download</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.map((payslip) => (
                    <TableRow key={payslip._id} className="bg-background shadow-lg rounded-lg border-separate">
                      <TableCell className="px-4">{payslip.employeeId}</TableCell>                    
                      <TableCell className="px-4">{payslip.week_no}</TableCell>
                      <TableCell className="px-4">{payslip.month_no}</TableCell>
                      <TableCell className="px-4">{payslip.year}</TableCell>
                      <TableCell className="px-4">${Number(payslip.netPayable).toFixed(2)}</TableCell>
                      {/* <TableCell className="px-4">
                        <a href={payslip.downloadLink} className="text-blue-500 underline">Download</a>
                      </TableCell> */}
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
};

export default Payslip;
