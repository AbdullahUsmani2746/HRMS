// pages/employers.js
"use client";
import Component from "@/components/Employee/costCenter";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import LoadingSpinner from "@/components/spinner";
import { useEffect, useState } from 'react'; 
import axios from 'axios'; 
import { Button } from '@/components/ui/button'; 
import Modal from '@/components/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSession } from "next-auth/react";
import Header from "@/components/breadcumb";

const CostCenter = () => {
  const router = useRouter();
  const{data: session}= useSession();
  const employerId = session.user.username;
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null); // To store data data for editing

  useEffect(() => {
    const fetchData= async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`/api/employees/costCenter?employerId=${employerId}`);
        setData(response.data.data);
      } catch (error) {
        console.error('Error fetching datas:', error);
      } finally {
        setIsLoading(false);  // Set loading to false once data is fetched
      }
    };
    fetchData();
  }, []);

  const openModal = (data = null) => {
    setSelectedData(data); // Set selected data if editing
    setIsModalOpen(true);
  };

  const closeModal = async() => {
    setIsModalOpen(false);
    setSelectedData(null); // Clear selected data
    const response = await axios.get(`/api/employees/costCenter?employerId=${employerId}`);
    setData(response.data.data); // Update the state with the fresh data  
    };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/employees/costCenter/${id}`);
      setData(data.filter(data => data._id !== id)); // Remove deleted application from state


    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const handleEdit = async (updatedData) => {
    try {
      const response = await axios.put(`/api/employee/costCenter/${updatedData._id}`, updatedData);
      setData(data.map(single => 
        single._id === updatedData._id ? response.data.data : single
      )); // Update data in state
    } catch (error) {
      console.error('Error updating Data:', error);
    }
  };

  return (
    <>
      <Header heading="Cost Center" />
      {isLoading ? (
        <LoadingSpinner />
      ) : (      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="transition-width duration-300 flex-1 p-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl">Cost Center</h1>
              <Button onClick={() => openModal()}>Add Cost Center</Button>
            </div>
            <Table className="shadow-md rounded-lg border-separate">
              <TableHeader>
                <TableRow className="bg-foreground text-left">
                  <TableHead className="px-4 py-2 font-semibold text-white" >Cost Center</TableHead>
                  <TableHead className="px-4 py-2 font-semibold text-white">Cost Center Description</TableHead>
                  <TableHead className="px-4 py-2 font-semibold text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map(single => (
                  <TableRow key={single._id} className="bg-background shadow-lg rounded-lg border-separate" > 
                    <TableCell className="px-4">{single.cost_center}</TableCell>
                    <TableCell className="px-4">{single.cost_center_description}</TableCell>
                    <TableCell>
                    <div className="flex space-x-2">
                  <Edit
                    aria-label="Edit employer"
                    className="cursor-pointer"
                    onClick={() => openModal(single)}
                  />
                  <Trash2
                    aria-label="Delete employer"
                    className="cursor-pointer"
                    onClick={() => handleDelete(single._id)}
                  />
                </div>
                        </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {isModalOpen && (
              <Modal onClose={closeModal}>
                <Component
                  existingData={selectedData} // Pass selected data for editing
                  onClose={closeModal}
                />
              </Modal>
            )}
          </div>
        </div>
      </div>)}
    </>
  );
};

export default CostCenter;
