import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DepartmentComponent = ({ existingData = null, onClose }) => {
  const [data, setData] = useState([{ department: '', department_description: '', employerId:'CLIENT-001' }]);
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
    setData([...data, { department: '', department_description: '', employerId:'CLIENT-001' }]);
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
        const appResponse = await axios.put(`/api/employees/department/${data[editIndex]._id}`, data[editIndex]);
        console.log('Location updated:', appResponse.data);
      } else {
        // Create new locations
        const appResponse = await axios.post('/api/employees/department', { data });
        console.log('Data created:', appResponse.data);
      }
      if (onClose) onClose();
    } catch (error) {
      console.error('Error submitting Data:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">{isEditing ? 'Edit Department' : 'Create Department'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {data.map((app, index) => (
          <div key={index} className="space-y-2 border-b pb-4">
           
            <div>
              <Input
                type="text"
                value={app.department}
                onChange={(e) => handleDataChange(index, 'department', e.target.value)}
                placeholder="Department"
                required
              />
            </div>
            <div>
              <Input
                type="text"
                value={app.department_description}
                onChange={(e) => handleDataChange(index, 'department_description', e.target.value)}
                placeholder="Department Description"
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
              Add Another Department
            </Button>
            <Button type="submit">Create Department</Button>
          </>
        )}
      </form>
    </div>
  );
};



export default DepartmentComponent;
