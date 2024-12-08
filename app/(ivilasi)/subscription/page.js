"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import SubscriptionProcess from "@/components/subProcess";
import { Edit, Edit2, Trash2 } from "lucide-react";

const Subscription = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscriptions, setSelectedSubscription] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use useEffect to open the modal after editMode is updated
  useEffect(() => {
    if (editMode && selectedSubscriptions) {
      setIsModalOpen(true);
      console.log(selectedSubscriptions);
    }
  }, [editMode, selectedSubscriptions]);
  const fetchData = async () => {
    try {
      const [subsResponse, detailsResponse, appsResponse] = await Promise.all(
        [
          axios.get("/api/subscriptionPlanMaster"),
          axios.get("/api/subscriptionPlanApplications"),
          axios.get("/api/applications"),
        ]
      );

      setSubscriptions(subsResponse.data.data);
      setSubscriptionDetails(detailsResponse.data.data);
      setApplications(appsResponse.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
   
    fetchData();
  }, []);

  const openModal = () => {
    setEditMode(false);
    console.log(editMode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditMode(false);
    console.log(editMode);
    setIsModalOpen(false);
    fetchData();

  };

  const getApplicationsForPlan = (planId) => {
    return subscriptionDetails
      .filter((detail) => detail.planId === planId)
      .map((detail) => {
        const app = applications.find(
          (application) => application._id === detail.applicationId
        );
        return app ? app.applicationName : "Unknown Application";
      });
  };

  const openEditModal = (subscription) => {
    setSelectedSubscription(subscription);
    setEditMode(true);
    console.log(editMode);
  };

  const deleteSubscription = async (subscriptionId) => {
    try {
      await axios.delete(`/api/subscriptionPlanMaster/${subscriptionId}`);
      await axios.delete(`/api/subscriptionPlanApplications/${subscriptionId}`);
      await axios.delete(`/api/subscriptionPlanDetail/${subscriptionId}`);

      setSubscriptions((prev) => prev.filter((sub) => sub._id !== subscriptionId));
    } catch (error) {
      console.error('Error deleting subscription:', error);
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
                <BreadcrumbPage>Subscription</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="transition-width duration-300 flex-1 p-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Subscriptions</h1>
              <Button onClick={openModal}>Add Subscription</Button>
            </div>
            <Table className="shadow-md rounded-lg border-separate">
              <TableHeader>
                <TableRow className="bg-foreground text-left">
                  <TableHead className="px-4 py-2 font-semibold text-white">Plan Name</TableHead>
                  <TableHead className="px-4 py-2 font-semibold text-white ">Subscription Fee</TableHead>
                  <TableHead className="px-4 py-2 font-semibold text-white">Applications</TableHead>
                  <TableHead className="px-4 py-2 font-semibold text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription._id} className="bg-background shadow-lg rounded-lg border-separate ">
                    <TableCell className="px-4">{subscription.planName}</TableCell>
                    <TableCell className="px-4">${subscription.subscriptionFee}</TableCell>
                    <TableCell className="px-4">
                      <ul className="list-disc px-4">
                        {getApplicationsForPlan(subscription._id).map(
                          (appName, index) => (
                            <li key={index} className="text-sm">{appName}</li>
                          )
                        )}
                      </ul>
                    </TableCell>
                    <TableCell className=" flex gap-2 items-center ">
                      <Button 
                        variant="outline" 
                        onClick={() => openEditModal(subscription)} 
                      >
                        <Edit className="" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => deleteSubscription(subscription._id)}
                      >
                        <Trash2 className="" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {isModalOpen && (
              <Modal onClose={closeModal}>
                <SubscriptionProcess        
                  editMode={editMode} 
                  initialData={editMode ? selectedSubscriptions : {}} 
                  onClose={closeModal}
                />
              </Modal>
            )}
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default Subscription;
