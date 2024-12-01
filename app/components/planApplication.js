import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'; // Ensure correct import

const SelectApplications = ({ planId, onNext }) => {
  const [applications, setApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);

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

  const handleApplicationChange = (applicationId) => {
    setSelectedApplications((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/subscriptionPlanApplications', {
        planId,
        applicationIds: selectedApplications,
      });
      onNext(selectedApplications); // Pass selected applications to the next step
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
                checked={selectedApplications.includes(app._id)}
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
