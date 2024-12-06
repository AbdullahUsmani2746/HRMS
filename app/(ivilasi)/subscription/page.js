  "use client"
  import { useEffect, useState } from 'react';
  import axios from 'axios';
  import { Button } from '@/components/ui/button';
  import Modal from '@/app/components/Modal';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
  import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
  import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
  import { Separator } from '@/components/ui/separator';
  import SubscriptionProcess from '@/app/components/subProcess';

  const Subscription = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [subscriptionDetails, setSubscriptionDetails] = useState([]);
    const [applications, setApplications] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const [subsResponse, detailsResponse, appsResponse] = await Promise.all([
            axios.get('/api/subscriptionPlanMaster'),
            axios.get('/api/subscriptionPlanApplications'),
            axios.get('/api/applications')
          ]);

          setSubscriptions(subsResponse.data.data);
          setSubscriptionDetails(detailsResponse.data.data);
          setApplications(appsResponse.data.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }, []);

    const openModal = () => {
      setIsModalOpen(true);
    };

    const closeModal = () => {
      setIsModalOpen(false);
    };

    const getApplicationsForPlan = (planId) => {
      return subscriptionDetails
        .filter(detail => detail.planId === planId)
        .map(detail => {
          const app = applications.find(application => application._id === detail.applicationId);
          return app ? app.applicationName : 'Unknown Application';
        });
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
                <h1 className="text-2xl">Subscriptions</h1>
                <Button onClick={openModal}>Add Subscription</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Subscription Fee</TableHead>
                    <TableHead>Applications</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map(subscription => (
                    <TableRow key={subscription._id}>
                      <TableCell>{subscription.planName}</TableCell>
                      <TableCell>${subscription.subscriptionFee}</TableCell>
                      <TableCell>
                        <ul>
                          {getApplicationsForPlan(subscription._id).map((appName, index) => (
                            <li key={index}>{appName}</li>
                          ))}
                        </ul>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {isModalOpen && (
                <Modal onClose={closeModal}>
                  <SubscriptionProcess />
                </Modal>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    );
  };

  export default Subscription;
