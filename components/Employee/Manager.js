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

const ManagerForm = React.memo(
  ({
    app,
    index,
    handleDataChange,
    removeData,
    department,
    employeeData,
    handleManagerCreation,
    isEditing,
    editIndex,
  }) => {
    return (
      <div className="space-y-2 border-b pb-4">
        {/* Manager Name (Read-only) */}
        <div>
          <Input
            type="text"
            value={app.manager || ""}
            placeholder="Manager Name"
            disabled
          />
        </div>

        {/* Department Selection */}
        <div>
          <Select
            value={app.departmentId?._id || ""}
            onValueChange={(value) => {
              const selectedDepartment = department.find(
                (dept) => dept._id === value
              );
              handleDataChange(index, "departmentId", selectedDepartment);
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  app.departmentId?.department || "Select Department"
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

        {/* Employee Selection */}
        {app.departmentId && (
          <div>
            <Select
              value={app.employeeId?._id || ""}
              onValueChange={(value) => {
                const selectedEmployee = employeeData.find(
                  (emp) => emp._id === value
                );
                handleDataChange(
                  index,
                  "employeeId",
                  selectedEmployee.employeeId
                );
                handleManagerCreation(selectedEmployee?._id);
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    app.employeeId
                      ? employeeData.find(
                          (emp) => emp.employeeId === app.employeeId
                        )?.firstName +
                        " " +
                        employeeData.find(
                          (emp) => emp.employeeId === app.employeeId
                        )?.surname
                      : "Select Employee"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {employeeData.map((emp) => (
                  <SelectItem key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.surname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Remove or Update Button */}
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
  }
);

ManagerForm.displayName = "ManagerForm";

const ManagerComponent = ({ existingData = null, onClose }) => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "";

  const [data, setData] = useState([
    {
      departmentId: null,
      manager: "",
      employeeId: null,
      clientId: employerId,
    },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [department, setDepartment] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);

  // Fetch Departments
  useEffect(() => {
    if (employerId) {
      const fetchDepartment = async () => {
        try {
          const response = await axios.get(
            `/api/employees/department?employerId=${employerId}`
          );
          setDepartment(response.data.data || []);
        } catch (error) {
          console.error("Error fetching departments:", error);
        }
      };
      fetchDepartment();
    }
  }, [employerId]);

  // Fetch Employees based on Department
  useEffect(() => {
    const activeDepartmentId = data[0]?.departmentId?._id;
    if (activeDepartmentId) {
      const fetchEmployeeData = async () => {
        try {
          const response = await axios.get(
            `/api/employees?departmentId=${activeDepartmentId}`
          );
          setEmployeeData(response.data.data || []);
        } catch (error) {
          console.error("Error fetching employees:", error);
        }
      };
      fetchEmployeeData();
    }
  }, [data]);

  // Handle Input Changes
  const handleDataChange = useCallback((index, field, value) => {
    setData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index] = { ...updatedData[index], [field]: value };
      return updatedData;
    });
  }, []);

  // Add New Manager Form
  const addData = useCallback(() => {
    setData((prevData) => [
      ...prevData,
      {
        manager: "",
        departmentId: null,
        employeeId: null,
      },
    ]);
  }, []);

  // Remove Manager Form
  const removeData = useCallback((index) => {
    setData((prevData) => prevData.filter((_, i) => i !== index));
  }, []);

  // Assign Manager
  const handleManagerCreation = async (employeeId) => {
    const selectedEmployee = employeeData.find((emp) => emp._id === employeeId);
    if (selectedEmployee) {
      const managerName = `${selectedEmployee.firstName} ${selectedEmployee.surname}`;
      handleDataChange(0, "manager", managerName);
    }
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && editIndex !== null) {
        await axios.put(
          `/api/employees/manager/${data[editIndex]._id}`,
          data[editIndex]
        );
      } else {
        await axios.post("/api/employees/manager", { data });
      }
      if (onClose) onClose();
    } catch (error) {
      console.error("Error submitting manager data:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">
        {isEditing ? "Edit Manager" : "Create Manager"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {data.map((app, index) => (
          <ManagerForm
            key={index}
            app={app}
            index={index}
            handleDataChange={handleDataChange}
            removeData={removeData}
            department={department}
            employeeData={employeeData}
            handleManagerCreation={handleManagerCreation}
            isEditing={isEditing}
            editIndex={editIndex}
          />
        ))}
        {!isEditing && (
          <div>
            <Button onClick={addData} className="m-2">
              Add Another Manager
            </Button>
            <Button type="submit">Create Manager</Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ManagerComponent;
