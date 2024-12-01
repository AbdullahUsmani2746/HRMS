import { useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Applications = () => {
  const [applications, setApplications] = useState([{ applicationName: '', details: '' }]);

  const handleApplicationChange = (index, field, value) => {
    const updatedApplications = [...applications];
    updatedApplications[index][field] = value;
    setApplications(updatedApplications);
  };

  const addApplication = () => {
    setApplications([...applications, { applicationName: '', details: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const appResponse = await axios.post('/api/applications', { applications });
      console.log('Applications created:', appResponse.data.data);
    } catch (error) {
      console.error('Error creating applications:', error);
    }
  };

  return (
    <div className="p-4 ">
      <h2 className="text-2xl mb-4">Create Applications</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {applications.map((app, index) => (
          <div key={index}>
            <div>
              <label className="block text-sm font-medium mb-2">Application Name</label>
              <Input
                type="text"
                value={app.applicationName}
                onChange={(e) => handleApplicationChange(index, 'applicationName', e.target.value)}
                placeholder="Application Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Details</label>
              <Input
                type="text"
                value={app.details}
                onChange={(e) => handleApplicationChange(index, 'details', e.target.value)}
                placeholder="Details"
                required
              />
            </div>
          </div>
        ))}
        <Button className="m-2"onClick={addApplication}>Add Another Application</Button>
        <Button type="submit">Create Applications</Button>
      </form>
    </div>
  );
};

export default Applications;
