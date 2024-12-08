import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const AssignPlanDetails = ({ planId, onClose }) => {
  const [employerDetails, setEmployerDetails] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
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
      onClose(); // Navigate to the next step
    } catch (error) {
      console.error('Error updating plan details:', error);
    }
  };

  return (
    <div>
      <h2 className="text-lg mb-4">Edit Plan Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="employer">
            <AccordionTrigger>Employer Access</AccordionTrigger>
            <AccordionContent>
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th>Application Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employerDetails.map((detail, index) => (
                    <tr key={detail.applicationId}>
                      <td>{getApplicationName(detail.applicationId)}</td>
                      <td>
                        <Select
                          value={detail.status}
                          onValueChange={(value) =>
                            handleDetailChange(setEmployerDetails, index, 'status', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GRANTED">GRANTED</SelectItem>
                            <SelectItem value="REVOKED">REVOKED</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="employee">
            <AccordionTrigger>Employee Access</AccordionTrigger>
            <AccordionContent>
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th>Application Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeDetails.map((detail, index) => (
                    <tr key={detail.applicationId}>
                      <td>{getApplicationName(detail.applicationId)}</td>
                      <td>
                        <Select
                          value={detail.status}
                          onValueChange={(value) =>
                            handleDetailChange(setEmployeeDetails, index, 'status', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GRANTED">GRANTED</SelectItem>
                            <SelectItem value="REVOKED">REVOKED</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Button type="submit">Update Details</Button>
      </form>
    </div>
  );
};


export default AssignPlanDetails;
