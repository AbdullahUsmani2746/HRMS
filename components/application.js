import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Applications = ({ existingApplication = null, onClose }) => {
  const [applications, setApplications] = useState([{ applicationName: '', details: '' }]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // If there's an existing application passed down, prepopulate the form
  useEffect(() => {
    if (existingApplication) {
      setApplications([existingApplication]);
      setIsEditing(true);
      setEditIndex(0);
    }
  }, [existingApplication]);

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
      if (isEditing && editIndex !== null) {
        // Edit application
        const appResponse = await axios.put(`/api/applications/${applications[editIndex]._id}`, applications[editIndex]);
        console.log('Application updated:', appResponse.data);
      } else {
        // Create new applications
        const appResponse = await axios.post('/api/applications', { applications });
        console.log('Applications created:', appResponse.data);
      }
      if (onClose) onClose();
    } catch (error) {
      console.error('Error submitting applications:', error);
    }
  };

  const handleEdit = (index) => {
    setIsEditing(true);
    setEditIndex(index);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/applications/${id}`);
      console.log('Application deleted:', response.data);
      setApplications(applications.filter((app) => app._id !== id)); // Remove deleted application from state
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">{isEditing ? 'Edit Application' : 'Create Applications'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {applications.map((app, index) => (
          <div key={index} className="space-y-2">
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
            {isEditing && editIndex === index && (
              <div className="flex gap-2 mt-2">
                <Button onClick={() => handleDelete(app._id)} className="bg-red-500">
                  Delete
                </Button>
                <Button type="submit" className="bg-blue-500">
                  Update Application
                </Button>
              </div>
            )}
          </div>
        ))}
        {!isEditing && (
          <Button onClick={addApplication} className="m-2">
            Add Another Application
          </Button>
        )}
        {!isEditing && <Button type="submit">Create Applications</Button>}
      </form>
    </div>
  );
};

export default Applications;
