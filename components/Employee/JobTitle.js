import { useState, useEffect } from "react";
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

const JobTitleComponent = ({ existingData = null, onClose }) => {
  const [data, setData] = useState([
    {
      job_title: "",
      job_title_description: "",
      departmentId: "",
      employerId: "CLIENT-001",
    },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [department, setDepartment] = useState([]);

  const fetchDepartment = async () => {
    try {
      const reposnse = await axios.get("/api/employees/department");
      setDepartment(reposnse.data.data);
    } catch (error) {
      console.error("Error getting Department Data", error);
    }
  };

  useEffect(() => {
    fetchDepartment();
  }, []);
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
    setData([
      ...data,
      {
        job_title: "",
        job_title_description: "",
        departmentId: "",
        employerId: "CLIENT-001",
      },
    ]);
  };

  const removeData = (index) => {
    const updatedData = [...data];
    updatedData.splice(index, 1);
    setData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && editIndex !== null) {
        // Edit existing location
        const appResponse = await axios.put(
          `/api/employees/jobTitle/${data[editIndex]._id}`,
          data[editIndex]
        );
        console.log("Location updated:", appResponse.data);
      } else {
        // Create new locations
        const appResponse = await axios.post("/api/employees/jobTitle", {
          data,
        });
        console.log("Data created:", appResponse.data);
      }
      if (onClose) onClose();
    } catch (error) {
      console.error("Error submitting Data:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">
        {isEditing ? "Edit Job Title" : "Create Job Title"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {data.map((app, index) => (
          <div key={index} className="space-y-2 border-b pb-4">
            <div>
              <Input
                type="text"
                value={app.job_title}
                onChange={(e) =>
                  handleDataChange(index, "job_title", e.target.value)
                }
                placeholder="Job Title"
                required
              />
            </div>
            <div>
              <Input
                type="text"
                value={app.job_title_description}
                onChange={(e) =>
                  handleDataChange(
                    index,
                    "job_title_description",
                    e.target.value
                  )
                }
                placeholder="Job Title Description"
                required
              />
            </div>
            <div>
              <Select
                value={app.departmentId}
                onValueChange={(value) =>
                  handleDataChange(index, "departmentId", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
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
              {index > 0 && !isEditing && (
                <Button
                  onClick={() => removeData(index)}
                  className="bg-red-500"
                >
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

export default JobTitleComponent;
