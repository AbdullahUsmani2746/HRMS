import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'; // Assuming you have an Accordion component

const AssignPlanDetails = ({ planId, applicationIds }) => {
  const [employerDetails, setEmployerDetails] = useState(applicationIds.map(applicationId => ({
    applicationId,
    status: 'GRANTED', // Default value
  })));

  const [employeeDetails, setEmployeeDetails] = useState(applicationIds.map(applicationId => ({
    applicationId,
    status: 'GRANTED', // Default value
  })));

  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get('/api/applications');
        setApplications(response.data.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };
    fetchApplications();
  }, []);

  const handleEmployerDetailChange = (index, field, value) => {
    const updatedDetails = [...employerDetails];
    updatedDetails[index][field] = value;
    setEmployerDetails(updatedDetails);
  };

  const handleEmployeeDetailChange = (index, field, value) => {
    const updatedDetails = [...employeeDetails];
    updatedDetails[index][field] = value;
    setEmployeeDetails(updatedDetails);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const planDetails = [
        ...employerDetails.map(detail => ({
          planId,
          applicationId: detail.applicationId,
          status: detail.status,
          grantee: 'EMPLOYER',
        })),
        ...employeeDetails.map(detail => ({
          planId,
          applicationId: detail.applicationId,
          status: detail.status,
          grantee: 'EMPLOYEE',
        })),
      ];
      await axios.post('/api/subscriptionPlanDetail', planDetails);
      console.log('Plan details assigned successfully');
    } catch (error) {
      console.error('Error assigning plan details:', error);
    }
  };

  const getApplicationName = (applicationId) => {
    const application = applications.find(app => app._id === applicationId);
    return application ? application.applicationName : 'Unknown Application';
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Assign Plan Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="employer">
            <AccordionTrigger>Employer Access</AccordionTrigger>
            <AccordionContent>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2">Application Name</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employerDetails.map((detail, index) => (
                    <tr key={detail.applicationId}>
                      <td className="py-2">{getApplicationName(detail.applicationId)}</td>
                      <td className="py-2">
                        <Select
                          value={detail.status}
                          onValueChange={(value) => handleEmployerDetailChange(index, 'status', value)}
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
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2">Application Name</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeDetails.map((detail, index) => (
                    <tr key={detail.applicationId}>
                      <td className="py-2">{getApplicationName(detail.applicationId)}</td>
                      <td className="py-2">
                        <Select
                          value={detail.status}
                          onValueChange={(value) => handleEmployeeDetailChange(index, 'status', value)}
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
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default AssignPlanDetails;
