// pages/employers.js
"use client";

import WorkLocation from "@/components/employee/WorkLocation";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import LoadingSpinner from "@/components/spinner";
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
import { useEffect, useState } from 'react'; 
import axios from 'axios'; 
import { Button } from '@/components/ui/button'; 
import Modal from '@/components/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Location = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state
  const [workLocations, setWorkLocations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkLocation, setSelectedWorkLocation] = useState(null); // To store location data for editing

  useEffect(() => {
    const fetchWorkLocations= async () => {
      setIsLoading(true)
      try {
        const response = await axios.get('/api/employees/workLocation');
        setWorkLocations(response.data.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setIsLoading(false);  // Set loading to false once data is fetched
      }
    };
    fetchWorkLocations();
  }, []);

  const openModal = (location = null) => {
    setSelectedWorkLocation(location); // Set selected location if editing
    setIsModalOpen(true);
  };

  const closeModal = async() => {
    setIsModalOpen(false);
    setSelectedWorkLocation(null); // Clear selected location
    const response = await axios.get('/api/employees/workLocation');
    setWorkLocations(response.data.data); // Update the state with the fresh data  
    };

  const handleDelete = async (locationId) => {
    try {
      await axios.delete(`/api/employees/workLocation/${locationId}`);
      setWorkLocations(workLocations.filter(location => location._id !== locationId)); // Remove deleted application from state


    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  const handleEdit = async (updatedLocation) => {
    try {
      const response = await axios.put(`/api/employee/workLocation/${updatedLocation._id}`, updatedLocation);
      setWorkLocations(workLocations.map(location => 
        location._id === updatedLocation._id ? response.data.data : location
      )); // Update location in state
    } catch (error) {
      console.error('Error updating location:', error);
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
                <BreadcrumbLink href="#">Hr Management Software</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Work Location</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      {isLoading ? (
        <LoadingSpinner />
      ) : (      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="transition-width duration-300 flex-1 p-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl">Work Location</h1>
              <Button onClick={() => openModal()}>Add Work Location</Button>
            </div>
            <Table className="shadow-md rounded-lg border-separate">
              <TableHeader>
                <TableRow className="bg-foreground text-left">
                  <TableHead className="px-4 py-2 font-semibold text-white" >Work Location</TableHead>
                  <TableHead className="px-4 py-2 font-semibold text-white">Work Location Description</TableHead>
                  <TableHead className="px-4 py-2 font-semibold text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workLocations.map(location => (
                  <TableRow key={location._id} className="bg-background shadow-lg rounded-lg border-separate" > 
                    <TableCell className="px-4">{location.work_location}</TableCell>
                    <TableCell className="px-4">{location.work_location_description}</TableCell>
                    <TableCell>
                    <div className="flex space-x-2">
                  <Edit
                    aria-label="Edit employer"
                    className="cursor-pointer"
                    onClick={() => openModal(location)}
                  />
                  <Trash2
                    aria-label="Delete employer"
                    className="cursor-pointer"
                    onClick={() => handleDelete(location._id)}
                  />
                </div>
                        </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {isModalOpen && (
              <Modal onClose={closeModal}>
                <WorkLocation
                  existingLocation={selectedWorkLocation} // Pass selected location for editing
                  onClose={closeModal}
                />
              </Modal>
            )}
          </div>
        </div>
      </div>)}
    </SidebarInset>
  );
};

export default Location;
