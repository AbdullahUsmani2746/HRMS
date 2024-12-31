// pages/employers.js
"use client";

import Applications from "@/components/application";
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
import Header from '@/components/breadcumb';
import axios from 'axios'; 
import { Button } from '@/components/ui/button'; 
import Modal from '@/components/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Application = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state
  const [applications, setApplications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null); // To store application data for editing

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get('/api/applications');
        setApplications(response.data.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);  // Set loading to false once data is fetched
      }
    };
    fetchApplications();
  }, []);

  const openModal = (application = null) => {
    setSelectedApplication(application); // Set selected application if editing
    setIsModalOpen(true);
  };

  const closeModal = async() => {
    setIsModalOpen(false);
    setSelectedApplication(null); // Clear selected application
    const response = await axios.get('/api/applications');
    setApplications(response.data.data); // Update the state with the fresh data  
    };

  const handleDelete = async (applicationId) => {
    try {
      await axios.delete(`/api/applications/${applicationId}`);
      await axios.delete(`/api/subscriptionPlanApplications/${applicationId}`);
      await axios.delete(`/api/subscriptionPlanDetail/${applicationId}`);
      setApplications(applications.filter(application => application._id !== applicationId)); // Remove deleted application from state
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const handleEdit = async (updatedApplication) => {
    try {
      const response = await axios.put(`/api/applications/${updatedApplication._id}`, updatedApplication);
      setApplications(applications.map(application => 
        application._id === updatedApplication._id ? response.data.data : application
      )); // Update application in state
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  return (
    
<>
<Header heading="Clients" />

      {isLoading ? (
        <LoadingSpinner />
      ) : (      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="transition-width duration-300 flex-1 p-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl">Applications</h1>
              <Button onClick={() => openModal()}>Add Application</Button>
            </div>
            <Table className="shadow-md rounded-lg border-separate">
              <TableHeader>
                <TableRow className="bg-foreground text-left">
                  <TableHead className="px-4 py-2 font-semibold text-white" >Application Name</TableHead>
                  <TableHead className="px-4 py-2 font-semibold text-white">Details</TableHead>
                  <TableHead className="px-4 py-2 font-semibold text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map(application => (
                  <TableRow key={application._id} className="bg-background shadow-lg rounded-lg border-separate" > 
                    <TableCell className="px-4">{application.applicationName}</TableCell>
                    <TableCell className="px-4">{application.details}</TableCell>
                    <TableCell>
                    <div className="flex space-x-2">
                  <Edit
                    aria-label="Edit employer"
                    className="cursor-pointer"
                    onClick={() => openModal(application)}
                  />
                  <Trash2
                    aria-label="Delete employer"
                    className="cursor-pointer"
                    onClick={() => handleDelete(application._id)}
                  />
                </div>
                        </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {isModalOpen && (
              <Modal onClose={closeModal}>
                <Applications
                  application={selectedApplication} // Pass selected application for editing
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

export default Application;
