import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const WorkLocations = ({ existingLocation = null, onClose,  }) => {
  const [locations, setLocations] = useState([{ work_location: '', work_location_description: '', employerId:'CLIENT-001' }]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Prepopulate form if editing
  useEffect(() => {
    if (existingLocation) {
      setLocations([existingLocation]);
      setIsEditing(true);
      setEditIndex(0);
    }
  }, [existingLocation]);

  const handleLocationChange = (index, field, value) => {
    const updatedLocations = [...locations];
    updatedLocations[index][field] = value;
    setLocations(updatedLocations);
  };

  const addLocation = () => {
    setLocations([...locations, { work_location: '', work_location_description: '',employerId:"CLIENT-001" }]);
  };

  const removeLocation = (index) => {
    const updatedLocations = [...locations];
    updatedLocations.splice(index, 1);
    setLocations(updatedLocations);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && editIndex !== null) {
        // Edit existing location
        const appResponse = await axios.put(`/api/employees/workLocation/${locations[editIndex]._id}`, locations[editIndex]);
        console.log('Location updated:', appResponse.data);
      } else {
        // Create new locations
        const appResponse = await axios.post('/api/employees/workLocation', { locations });
        console.log('Locations created:', appResponse.data);
      }
      if (onClose) onClose();
    } catch (error) {
      console.error('Error submitting locations:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">{isEditing ? 'Edit Location' : 'Create Location'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {locations.map((app, index) => (
          <div key={index} className="space-y-2 border-b pb-4">
            <div>
              <Input
                type="text"
                value={app.work_location}
                onChange={(e) => handleLocationChange(index, 'work_location', e.target.value)}
                placeholder="Location Name"
                required
              />
            </div>
            <div>
              <Input
                type="text"
                value={app.work_location_description}
                onChange={(e) => handleLocationChange(index, 'work_location_description', e.target.value)}
                placeholder="Details"
                required
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              {index > 0 && !isEditing && (
                <Button onClick={() => removeLocation(index)} className="bg-red-500">
                  Remove
                </Button>
              )}
              {isEditing && editIndex === index && (
                <Button type="submit" className="bg-blue-500">
                  Update Location
                </Button>
              )}
            </div>
          </div>
        ))}
        {!isEditing && (
          <>
            <Button onClick={addLocation} className="m-2">
              Add Another Location
            </Button>
            <Button type="submit">Create Locations</Button>
          </>
        )}
      </form>
    </div>
  );
};



export default WorkLocations;
