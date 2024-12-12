import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DeductionComponent = ({ existingData = null, onClose }) => {
  const [data, setData] = useState([{ deduction: '', deduction_description: '',deduction_rate:'', employerId:'CLIENT-001' }]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Prepopulate form if editing
  useEffect(() => {
    if (existingData) {
      setData([existingData]);
      setIsEditing(true);
      setEditIndex(0);
    }
  }, [existingData]);

  const handleDataChange = (index, field, value) => {
    const updatedData = [...data];
    updatedData[index][field] = value;
    setData(updatedData);
  };

  const addData = () => {
    setData([...data, { deduction: '', deduction_description: '',deduction_rate:'' ,employerId:'CLIENT-001' }]);
  };

  const removeData= (index) => {
    const updatedData = [...data];
    updatedData.splice(index, 1);
    setData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && editIndex !== null) {
        // Edit existing location
        const appResponse = await axios.put(`/api/employees/deduction/${data[editIndex]._id}`, data[editIndex]);
        console.log('Location updated:', appResponse.data);
      } else {
        // Create new locations
        const appResponse = await axios.post('/api/employees/deduction', { data });
        console.log('Data created:', appResponse.data);
      }
      if (onClose) onClose();
    } catch (error) {
      console.error('Error submitting Data:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">{isEditing ? 'Edit' : 'Create'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {data.map((app, index) => (
          <div key={index} className="space-y-2 border-b pb-4">
           
            <div>
              <Input
                type="text"
                value={app.deduction}
                onChange={(e) => handleDataChange(index, 'deduction', e.target.value)}
                placeholder="Deduction"
                required
              />
            </div>
            <div>
              <Input
                type="text"
                value={app.deduction_description}
                onChange={(e) => handleDataChange(index, 'deduction_description', e.target.value)}
                placeholder="Deduction Description"
                required
              />
            </div>
            <div>
              <Input
                type="number"
                value={app.deduction_rate}
                onChange={(e) => handleDataChange(index, 'deduction_rate', e.target.value)}
                placeholder="Deduction Rate"
                required
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              {index > 0 && !isEditing && (
                <Button onClick={() => removeData(index)} className="bg-red-500">
                  Remove
                </Button>
              )}
              {isEditing && editIndex === index && (
                <Button type="submit" className="bg-red-500 hover:bg-red-700">
                  Update 
                </Button>
              )}
            </div>
          </div>
        ))}
        {!isEditing && (
          <>
            <Button onClick={addData} className="m-2">
              Add Another Deduction
            </Button>
            <Button type="submit">Create Deduction</Button>
          </>
        )}
      </form>
    </div>
  );
};



export default DeductionComponent;
