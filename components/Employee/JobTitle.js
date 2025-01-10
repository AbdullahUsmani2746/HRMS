import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Memoized Child Component to prevent unnecessary re-renders
import React from "react";
const JobTitleForm = React.memo(({ app, index, department, handleDataChange, removeData, isEditing, editIndex }) => {
  return (
    <div className="space-y-2 border-b pb-4">
      <div>
        <Input
          type="text"
          value={app.job_title}
          onChange={(e) => handleDataChange(index, "job_title", e.target.value)}
          placeholder="Job Title"
          required
        />
      </div>
      <div>
        <Input
          type="text"
          value={app.job_title_description}
          onChange={(e) =>
            handleDataChange(index, "job_title_description", e.target.value)
          }
          placeholder="Job Title Description"
          required
        />
      </div>
      <div>
        <Select
          value={app.departmentId?._id || ""} // Use _id from the departmentId object
          onValueChange={(value) => {
            const selectedDepartment = department.find((dept) => dept._id === value);
            handleDataChange(index, "departmentId", selectedDepartment); // Save the whole department object
          }}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                app.departmentId?.department || "Select Department" // Use department name as placeholder
              }
            />
          </SelectTrigger>
          <SelectContent>
            {department.map((single) => (
              <SelectItem key={single._id} value={single._id}>
                {single.department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between items-center mt-2">
        {!isEditing && index > 0 && (
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
  );
});

JobTitleForm.displayName = "JobTitleForm";


const JobTitleComponent = ({ existingData = null, onClose }) => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "";
console.log("EMployerID", employerId)
  const [data, setData] = useState([
    {
      departmentId: null,
      job_title: "",
      job_title_description: "",
      employerId: employerId,
    },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [department, setDepartment] = useState([]);

  // Fetch departments only when employerId exists
  useEffect(() => {
    if (employerId) {
      const fetchDepartment = async () => {
        try {
          const response = await axios.get(`/api/employees/department?employerId=${employerId}`);
          setDepartment(response.data.data || []);
        } catch (error) {
          console.error("Error getting Department Data", error);
        }
      };
      fetchDepartment();
    }
  }, [employerId]);

  // Prepopulate form if editing
  useEffect(() => {
    if (existingData && data[0]?._id !== existingData._id) {
      setData([existingData]);
      setIsEditing(true);
      setEditIndex(0);
    }
  }, [existingData]);

  // Avoid re-creating these functions on every render using `useCallback`
  const handleDataChange = useCallback((index, field, value) => {
    setData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index] = { ...updatedData[index], [field]: value };
      return updatedData;
    });
  }, []);

  const addData = useCallback(() => {
    setData((prevData) => [
      ...prevData,
      {
        job_title: "",
        job_title_description: "",
        departmentId: "",
        employerId: employerId,
      },
    ]);
  }, [employerId]);

  const removeData = useCallback((index) => {
    setData((prevData) => prevData.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && editIndex !== null) {
        // Update existing data
        const appResponse = await axios.put(`/api/employees/jobTitle/${data[editIndex]._id}`, data[editIndex]);
        console.log("Job Title updated:", appResponse.data);
      } else {
        // Create new data
        const appResponse = await axios.post("/api/employees/jobTitle", { data });
        console.log("Job Title created:", appResponse.data);
      }
      if (onClose) onClose(); // Close modal or form
    } catch (error) {
      console.error("Error submitting Job Title Data:", error);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-2xl mb-4">{isEditing ? "Edit Job Title" : "Create Job Title"}</h2>
      {console.log("Data", data)}
      <form onSubmit={handleSubmit} className="space-y-4">
        {  data[0] ?  (data?.map((app, index) => (
          <JobTitleForm
            key={index}
            app={app}
            index={index}
            department={department}
            handleDataChange={handleDataChange}
            removeData={removeData}
            isEditing={isEditing}
            editIndex={editIndex}
          />
        ))) : null}
        {!isEditing && (
          <>
            <Button onClick={addData} className="m-2">
              Add Another Job Title
            </Button>
            <Button type="submit">Create Job Title</Button>
          </>
        )}
      </form>
    </div>
  );
};

export default JobTitleComponent;
