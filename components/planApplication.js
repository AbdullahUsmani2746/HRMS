import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'; // Ensure correct import

const SelectApplications = ({ isEdit, planId, selectedApplications = [], onNext }) => {
  const [applications, setApplications] = useState([]);  // To store all applications
  const [selected, setSelected] = useState(selectedApplications);  // Pre-set selected state to passed prop

  // Fetch all applications and pre-select based on edit mode
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Fetch all applications only once
        console.log(isEdit)
        console.log(selectedApplications)

        const allAppsResponse = await axios.get('/api/applications');
        const allApplications = allAppsResponse.data.data;
        setApplications(allApplications);

        // If editing, fetch assigned applications for the given planId
        if (isEdit && planId) {
          const assignedResponse = await axios.get(
            `/api/subscriptionPlanApplications?planId=${planId}`
          );
          const assignedApplications = assignedResponse.data.data.map((app) => app.applicationId);
          setSelected(assignedApplications);  // Update selected applications based on assigned plan
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    // Call fetchApplications only on component mount
    fetchApplications();
  }, [isEdit, planId]);  // Only run the effect when `isEdit` or `planId` changes

  const handleApplicationChange = (applicationId) => {
    setSelected((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send data to API (POST for new, PUT for edit)
      if (!isEdit) {
        await axios.post('/api/subscriptionPlanApplications', {
          planId,
          applicationIds: selected,
        });
      } else {
        await axios.put(`/api/subscriptionPlanApplications/${planId}`, {
          applicationIds: selected,
        });
      }
      onNext(selected); // Proceed to the next step
    } catch (error) {
      console.error('Error assigning applications:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Select Applications</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {applications.map((app) => (
          <div key={app._id}>
            <label className="flex items-center space-x-3">
              <Checkbox
                checked={selected.includes(app._id)}
                onCheckedChange={() => handleApplicationChange(app._id)}
              />
              <span>{app.applicationName}</span>
            </label>
          </div>
        ))}
        <Button type="submit">Next</Button>
      </form>
    </div>
  );
};

export default SelectApplications;
