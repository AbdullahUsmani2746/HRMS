import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Save, Users, UserCircle } from 'lucide-react';

// Animation configurations for smooth transitions
const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.1 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  },
  item: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  }
};

const AssignPlanDetails = ({ planId, onClose }) => {
  const [employerDetails, setEmployerDetails] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const appResponse = await axios.get('/api/applications');
        const allApplications = appResponse.data.data;

        const subPlanAppResponse = await axios.get(
          `/api/subscriptionPlanApplications?planId=${planId}`
        );
        const assignedApplications = subPlanAppResponse.data.data;

        const relevantApplications = allApplications.filter((app) =>
          assignedApplications.some(
            (assignedApp) => assignedApp.applicationId === app._id
          )
        );

        const planDetailsResponse = await axios.get(
          `/api/subscriptionPlanDetail?planId=${planId}`
        );
        const existingDetails = planDetailsResponse.data.data;

        const mergedEmployerDetails = relevantApplications.map((app) => {
          const existingDetail = existingDetails.find(
            (detail) =>
              detail.applicationId === app._id && detail.grantee === 'EMPLOYER'
          );
          return (
            existingDetail || {
              applicationId: app._id,
              status: 'GRANTED',
              grantee: 'EMPLOYER',
            }
          );
        });

        const mergedEmployeeDetails = relevantApplications.map((app) => {
          const existingDetail = existingDetails.find(
            (detail) =>
              detail.applicationId === app._id && detail.grantee === 'EMPLOYEE'
          );
          return (
            existingDetail || {
              applicationId: app._id,
              status: 'REVOKED',
              grantee: 'EMPLOYEE',
            }
          );
        });

        setApplications(relevantApplications);
        setEmployerDetails(mergedEmployerDetails);
        setEmployeeDetails(mergedEmployeeDetails);
      } catch (error) {
        console.error('Error fetching plan details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [planId]);

  const getApplicationName = (applicationId) => {
    const application = applications.find((app) => app._id === applicationId);
    return application ? application.applicationName : 'Unknown Application';
  };

  const handleDetailChange = (setDetail, index, field, value) => {
    setDetail((prevDetails) => {
      const updatedDetails = [...prevDetails];
      updatedDetails[index][field] = value;
      return updatedDetails;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = [
        ...employerDetails.map((detail) => ({
          planId,
          applicationId: detail.applicationId,
          status: detail.status,
          grantee: 'EMPLOYER',
        })),
        ...employeeDetails.map((detail) => ({
          planId,
          applicationId: detail.applicationId,
          status: detail.status,
          grantee: 'EMPLOYEE',
        })),
      ];

      await axios.put(`/api/subscriptionPlanDetail/${planId}`, payload);
      onClose();
    } catch (error) {
      console.error('Error updating plan details:', error);
    }
  };

  const renderTable = (details, setDetails, type) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-background/10">
            <th className="text-left py-3 px-4 text-background/60">Application Name</th>
            <th className="text-left py-3 px-4 text-background/60">Status</th>
          </tr>
        </thead>
        <tbody>
          {details.map((detail, index) => (
            <motion.tr
              key={detail.applicationId}
              variants={ANIMATION_VARIANTS.item}
              className="border-b border-background/5 hover:bg-background/5"
            >
              <td className="py-3 px-4">{getApplicationName(detail.applicationId)}</td>
              <td className="py-3 px-4">
                <Select
                  value={detail.status}
                  onValueChange={(value) =>
                    handleDetailChange(setDetails, index, 'status', value)
                  }
                >
                  <SelectTrigger className="bg-background/5 border-background/10">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GRANTED">GRANTED</SelectItem>
                    <SelectItem value="REVOKED">REVOKED</SelectItem>
                  </SelectContent>
                </Select>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="bg-foreground border-white/10 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-background">
            Plan Access Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              variants={ANIMATION_VARIANTS.item}
              className="space-y-4 rounded-lg bg-background/5 border border-background/10"
            >
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="employer" className="border-b border-background/10">
                  <AccordionTrigger className="px-4 py-3 hover:bg-background/5">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span>Employer Access</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-2 pb-4">
                    {renderTable(employerDetails, setEmployerDetails, 'employer')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="employee">
                  <AccordionTrigger className="px-4 py-3 hover:bg-background/5">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-5 h-5" />
                      <span>Employee Access</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-2 pb-4">
                    {renderTable(employeeDetails, setEmployeeDetails, 'employee')}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>

            <div className="flex justify-end gap-2 pt-4 border-t border-background/10">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="border-background/10 text-foreground hover:bg-background/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-background text-foreground hover:bg-background/90"
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Access Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AssignPlanDetails;