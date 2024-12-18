import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Country, City } from "country-state-city";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // Ensure correct import

import LoadingSpinner from "@/components/spinner";

const PopupForm = ({ onClose, setEmployees, employeeToEdit }) => {
  const { data: session } = useSession();
  const clientId = session.user.username;
  console.log(clientId);
  const [employeeData, setEmployeeData] = useState({
    firstName: "",
    middleName: "",
    surname: "",
    dob: "",
    gender: "",
    phoneNumber: "",
    emailAddress: "",
    village: "",
    status: "ACTIVE",
    hireDate: "",
    jobTitle: "",
    department: "",
    paySchedule: "",
    workLocation: "",
    manager: "",
    clientId: clientId, // Default client ID
    employeeId: "",
    paymentMethod: "CHEQUE",
    bankName: "",
    accountName: "",
    accountNumber: "",
    payType: "HOUR",
    ratePerHour: "",
    payFrequency: "WEEK",
    employeeType: "",
    costCenter: "",
    allownces: [],
    deductions: [],
    leaves: [],
    profileImage: "", // For storing the uploaded image
    documents: [], // For storing the uploaded documents
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [costCenter, setcostCenter] = useState([]);
  const [department, setDepartment] = useState([]);
  const [location, setlocation] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [allownce, setAllownce] = useState([]);
  const [deduction, setDeduction] = useState([]);
  const [leave, setLeave] = useState([]);
  const [jobTitle, setJobTitle] = useState([]);
  const [employeeType, setEmployeeType] = useState([]);
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedAllownces, setselectedAllownces] = useState([]);
  const [selectedDeductions, setselectedDeductions] = useState([]);
  const [selectedLeaves, setselectedLeaves] = useState([]);

  const [profileImage, setProfileImage] = useState();
  const [uploadDocument, setUploadDocument] = useState([]);

  const handleSelectLeaveChange = (leaveID, value) => {
    setEmployeeData((prev) => ({
      ...prev,
      leaves: prev.leaves.map((leave) =>
        leave.leaveId === leaveID ? { ...leave, available: value } : leave
      ),
    }));
  };

  const handleLeaveCheckboxChange = (leaveID) => {
    setEmployeeData((prev) => {
      const isSelected = prev.leaves.find((leave) => leave.leaveId === leaveID);
      return {
        ...prev,
        leaves: isSelected
          ? prev.leaves.filter((leave) => leave.leaveId !== leaveID)
          : [...prev.leaves, { leaveId: leaveID, available: 0 }],
      };
    });
  };

  const uniqueCities = useMemo(() => {
    return Array.from(new Set(cities.map((city) => city.name))).map((name) =>
      cities.find((city) => city.name === name)
    );
  }, [cities]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        costRepsonse,
        depResponse,
        scheduleResponse,
        locationResponse,
        deductionResponse,
        allownceResponse,
        jobTitleResponse,
        employeeTypeResponse,
        leaveResponse,
      ] = await Promise.all([
        axios.get(`/api/employees/costCenter?employerId=${clientId}`),
        axios.get(`/api/employees/department?employerId=${clientId}`),
        axios.get(`/api/employees/schedule?employerId=${clientId}`),
        axios.get(`/api/employees/workLocation?employerId=${clientId}`),
        axios.get(`/api/employees/deduction?employerId=${clientId}`),
        axios.get(`/api/employees/allownce?employerId=${clientId}`),
        axios.get(`/api/employees/jobTitle?employerId=${clientId}`),
        axios.get(`/api/employees/employeeType?employerId=${clientId}`),
        axios.get(`/api/employees/leave?employerId=${clientId}`),
      ]);

      setcostCenter(costRepsonse.data.data);
      setDepartment(depResponse.data.data);
      setSchedule(scheduleResponse.data.data);
      setlocation(locationResponse.data.data);
      setAllownce(allownceResponse.data.data);
      setDeduction(deductionResponse.data.data);
      setJobTitle(jobTitleResponse.data.data);
      setEmployeeType(employeeTypeResponse.data.data);
      setLeave(leaveResponse.data.data);

      console.log(allownce);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (employeeToEdit) {
      setEmployeeData(employeeToEdit);
      setselectedDeductions(employeeToEdit.deductions);
      setselectedAllownces(employeeToEdit.allownces);
    } else {
      generateEmployeeId();
    }
  }, [employeeToEdit]);

  const handleCountryChange = (value) => {
    const countryISOCode = Country.getCountryByCode(value)?.isoCode;
    setEmployeeData((prev) => ({
      ...prev,
      country: value,
      city: countryISOCode === prev.country ? prev.city : "",
    }));

    if (countryISOCode) {
      setCities(City.getCitiesOfCountry(countryISOCode));
    }
  };

  const generateEmployeeId = async () => {
    try {
      // Fetch all employees
      const response = await axios.get("/api/employees");
      const employees = response?.data?.data || [];

      // Ensure `clientId` exists
      const clientNumber = employeeData?.clientId?.split("-")[1]; // Extract the client number (e.g., "001")
      if (!clientNumber) {
        throw new Error("Client ID is invalid or missing");
      }

      // Filter employees by the current client ID
      const clientEmployees = employees.filter(
        (emp) => emp.clientId === employeeData.clientId
      );

      // Determine the next employee number
      const maxId = clientEmployees.length
        ? clientEmployees
            .map((emp) => parseInt(emp.employeeId.split("-")[1], 10)) // Extract the number after the client part
            .reduce((max, current) => (current > max ? current : max), 0) // Find the maximum number
        : 0; // If no employees, start from 0

      const nextEmployeeNumber = String(maxId + 1).padStart(4, "0"); // Increment and pad to 4 digits

      // Set the new employee ID
      setEmployeeData((prev) => ({
        ...prev,
        employeeId: `${clientNumber}-${nextEmployeeNumber}`, // Combine client number and employee number
      }));
    } catch (error) {
      console.error("Error generating employee ID:", error.message || error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (id, type) => {
    console.log(id);
    console.log(selectedAllownces);
    if (type === "allownce") {
      setselectedAllownces((prevSelected) => {
        const updatedSelected = prevSelected.includes(id)
          ? prevSelected.filter((item) => item !== id)
          : [...prevSelected, id];

        // Add allowances array to employee data
        setEmployeeData((prevData) => ({
          ...prevData,
          allownces: updatedSelected, // Add updated array to employee data
        }));

        return updatedSelected;
      });
    } else if (type === "deduction") {
      setselectedDeductions((prevSelected) => {
        const updatedSelected = prevSelected.includes(id)
          ? prevSelected.filter((item) => item !== id)
          : [...prevSelected, id];

        // Add deductions array to employee data
        setEmployeeData((prevData) => ({
          ...prevData,
          deductions: updatedSelected, // Add updated array to employee data
        }));

        return updatedSelected;
      });
    } else if (type === "leaves") {
      setselectedLeaves((prevSelected) => {
        const updatedSelected = prevSelected.includes(id)
          ? prevSelected.filter((item) => item !== id)
          : [...prevSelected, id];

        // Add deductions array to employee data
        setEmployeeData((prevData) => ({
          ...prevData,
          leaves: updatedSelected, // Add updated array to employee data
        }));

        return updatedSelected;
      });
    }
  };
  const validateForm = () => {
    const validationErrors = {};
    if (!employeeData.firstName.trim())
      validationErrors.firstName = "First name is required.";
    if (!employeeData.surname.trim())
      validationErrors.surname = "Surname is required.";
    if (!employeeData.emailAddress.trim())
      validationErrors.emailAddress = "Email address is required.";
    if (!employeeData.phoneNumber.trim())
      validationErrors.phoneNumber = "Phone number is required.";

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(employeeData);
    setIsSubmitting(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      let profileImageUrl =
        employeeData.profileImage ||
        `/uploads/profileImage/No_image_placeholder.gif`;
      let docURL = [...(employeeData.documents || [])]; // Clone existing documents to avoid direct state mutation

      if (employeeToEdit) {
        // Handle profile image upload if a new image is selected
        if (profileImage && profileImage instanceof Blob) {
          const formData = new FormData();
          formData.append("file", profileImage);

          const Imageresponse = await axios.post(
            "/api/upload/image",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          profileImageUrl = Imageresponse.data.url;
        }

        // Handle new document uploads
        if (uploadDocument.length > 0) {
          const formData2 = new FormData();
          uploadDocument.forEach((doc) => {
            formData2.append("files", doc.file);
          });

          const DocResponse = await axios.post(
            "/api/upload/document",
            formData2,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          // Combine existing documents with newly uploaded ones
          const newDocuments = DocResponse.data.files.map((file, index) => ({
            url: file.url,
            name: file.name,
            description: uploadDocument[index].description,
          }));

          docURL = [...docURL, ...newDocuments];
        }

        // Update employee data
        const response = await axios.put(
          `/api/employees/${employeeToEdit._id}`,
          {
            ...employeeData,
            profileImage: profileImageUrl,
            documents: docURL,
          }
        );

        setEmployees((prev) =>
          prev.map((emp) =>
            emp._id === employeeToEdit._id ? response.data.data : emp
          )
        );
      } else {
        // Handle file upload for new employee
        if (profileImage && profileImage instanceof Blob) {
          const formData = new FormData();
          formData.append("file", profileImage);

          const Imageresponse = await axios.post(
            "/api/upload/image",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          profileImageUrl = Imageresponse.data.url;
        }

        if (uploadDocument.length > 0) {
          const formData2 = new FormData();
          uploadDocument.forEach((doc) => {
            formData2.append("files", doc.file);
          });

          const DocResponse = await axios.post(
            "/api/upload/document",
            formData2,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          docURL = DocResponse.data.files.map((file, index) => ({
            url: file.url,
            name: file.name,
            description: uploadDocument[index].description,
          }));
        }

        // Create new employee
        const response = await axios.post("/api/employees", {
          ...employeeData,
          profileImage: profileImageUrl,
          documents: docURL,
        });

        setEmployees((prev) => [...prev, response.data.data]);
      }

      onClose();
    } catch (error) {
      console.error("Error saving employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e, type) => {
    if (type === "profileImage") {
      const file = e.target.files[0];
      console.log(file);
      setProfileImage(file);
    } else if (type === "documents") {
      console.log(type);
      const files = Array.from(e.target.files); // Get all selected files
      console.log(files);
      const newDocuments = files.map((file) => ({
        file,
        name: file.name,
        description: "", // Initial empty description
      }));
      setUploadDocument(newDocuments);
    }
    console.log(employeeData);
  };

  const removeDocument = (index) => {
    setEmployeeData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));

    setUploadDocument((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle document description change
  const handleDescriptionChange = (index, description) => {
    const updatedDocuments =
      uploadDocument.length > 0
        ? [...uploadDocument]
        : [...employeeData.documents];
    console.log(index);
    console.log(description);

    updatedDocuments[index].description = description;
    setUploadDocument(updatedDocuments);
    console.log(uploadDocument);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {employeeToEdit ? "Edit Employee" : "Add Employee"}
          </DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 px-1 h-[75vh] overflow-y-auto"
          >
            {/* Image Upload */}

            <div className="max-w-sm mx-auto">
              <div className="border border-background-300 p-4 rounded-lg shadow-sm">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  {console.log(profileImage)}
                  {profileImage || employeeData.profileImage ? (
                    <img
                      src={
                        profileImage
                          ? URL.createObjectURL(profileImage)
                          : employeeData.profileImage
                      }
                      alt="Profile Preview"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full rounded-full bg-gray-100 text-gray-500">
                      <span>No Image</span>{" "}
                    </div>
                  )}
                </div>
                <label className="block text-center border-2 bg-foreground text-white py-2 px-4 rounded cursor-pointer hover:bg-background hover:border-2 hover:text-foreground transition duration-150">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "profileImage")}
                    className="hidden"
                  />
                  {employeeData.profileImage ? "Change Image" : "Upload Image "}
                </label>
              </div>
            </div>

            {/* Document Upload */}
            <h3 className="text-md font-bold">Documents</h3>
            <section>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => handleFileChange(e, "documents")}
              />
              <ul className="mt-2">
                {(uploadDocument.length > 0
                  ? uploadDocument
                  : employeeData.documents
                ).map((doc, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <div>
                      <span>{doc.name}</span>
                      <input
                        type="text"
                        placeholder="Enter description"
                        value={doc.description}
                        onChange={(e) =>
                          handleDescriptionChange(index, e.target.value)
                        }
                        className="ml-2 p-1 border rounded"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Employee Details */}
            <h3 className="text-md font-bold">Employee Details</h3>
            <section className="grid grid-cols-2 gap-4">
              <Input
                name="employeeId"
                value={employeeData.employeeId}
                onChange={handleChange}
                placeholder="Employee ID"
                readOnly
              />
              <Input
                name="clientId"
                value={employeeData.clientId}
                onChange={handleChange}
                placeholder="Client ID"
                readOnly
              />
            </section>

            {/* Personal Details */}
            <h3 className="text-md font-bold">Personal Details</h3>
            <section className="grid grid-cols-3 gap-4">
              <Input
                name="firstName"
                value={employeeData.firstName}
                onChange={handleChange}
                placeholder="First Name"
              />
              <Input
                name="middleName"
                value={employeeData.middleName}
                onChange={handleChange}
                placeholder="Middle Name"
              />
              <Input
                name="surname"
                value={employeeData.surname}
                onChange={handleChange}
                placeholder="Surname"
              />
              <Input
                type="date"
                name="dob"
                value={employeeData.dob}
                onChange={handleChange}
                placeholder="Date of Birth"
              />
              <Select
                value={employeeData.gender}
                onValueChange={(value) =>
                  setEmployeeData((prev) => ({ ...prev, gender: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <Input
                name="village"
                value={employeeData.village}
                onChange={handleChange}
                placeholder="Village"
              />
            </section>

            {/* Contact Details */}
            <h3 className="text-md font-bold">Contact Details</h3>

            <section className="grid grid-cols-2 gap-4">
              <Input
                name="phoneNumber"
                value={employeeData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
              />
              <Input
                name="emailAddress"
                value={employeeData.emailAddress}
                onChange={handleChange}
                placeholder="Email Address"
              />
            </section>

            {/* Job Details */}
            <h3 className="text-md font-bold">Job Details</h3>

            <section className="grid grid-cols-3 gap-4">
              <Input
                name="hireDate"
                type="date"
                value={employeeData.hireDate}
                onChange={handleChange}
                placeholder="Hire Date"
              />
              <Select
                value={employeeData.jobTitle}
                onValueChange={(value) =>
                  setEmployeeData((prev) => ({
                    ...prev,
                    jobTitle: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      jobTitle.find((jt) => jt._id === employeeData.jobTitle)
                        ?.job_title || "Job Tilte"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {jobTitle.map((single) => (
                    <SelectItem key={single._id} value={single._id}>
                      {single.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={
                  employeeData.department  // Bind the selected department ID to the select value
                }
                onValueChange={(value) =>
                  setEmployeeData((prev) => ({
                    ...prev,
                    department: value, // Update the department in state when a new value is selected
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      department.find(
                        (dept) => dept._id === employeeData.department
                      )?.department || "Department"
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

              <Select
                value={employeeData.paySchedule}
                onValueChange={(value) =>
                  setEmployeeData((prev) => ({
                    ...prev,
                    paySchedule: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      schedule.find(
                        (sch) => sch._id === employeeData.paySchedule
                      )?.pay_schedule || "Pay Schedule"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {schedule.map((single) => (
                    <SelectItem key={single._id} value={single._id}>
                      {single.pay_schedule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={employeeData.workLocation}
                onValueChange={(value) =>
                  setEmployeeData((prev) => ({
                    ...prev,
                    workLocation: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      location.find(
                        (wl) => wl._id === employeeData.workLocation
                      )?.work_location || "Work Location"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {location.map((single) => (
                    <SelectItem key={single._id} value={single._id}>
                      {single.work_location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                name="manager"
                value={employeeData.manager}
                onChange={handleChange}
                placeholder="Manager"
              />

              <Select
                value={employeeData.costCenter}
                onValueChange={(value) =>
                  setEmployeeData((prev) => ({
                    ...prev,
                    costCenter: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      costCenter.find(
                        (cc) => cc._id === employeeData.costCenter
                      )?.cost_center || "Cost Center"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {costCenter.map((single) => (
                    <SelectItem key={single._id} value={single._id}>
                      {single.cost_center}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>

            {/* Payment Details */}
            <h3 className="text-MD font-bold">Payment Details</h3>
            <section>
              <div className="grid grid-cols-3 gap-4">
                <Select
                  value={employeeData.paymentMethod}
                  onValueChange={(value) =>
                    setEmployeeData((prev) => ({
                      ...prev,
                      paymentMethod: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="DIRECT DEPOSIT">
                      Direct Deposit
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  name="bankName"
                  value={employeeData.bankName}
                  onChange={handleChange}
                  placeholder="Bank Name"
                />
                <Input
                  name="accountName"
                  value={employeeData.accountName}
                  onChange={handleChange}
                  placeholder="Account Name"
                />
                <Input
                  name="accountNumber"
                  value={employeeData.accountNumber}
                  onChange={handleChange}
                  placeholder="Account Number"
                />
              </div>
            </section>

            {/* Pay Details */}
            <h3 className="text-MD font-bold">Pay Details</h3>

            <section>
              <div className="grid grid-cols-3 gap-4">
                <Select
                  value={employeeData.payType}
                  onValueChange={(value) =>
                    setEmployeeData((prev) => ({ ...prev, payType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pay Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOUR">Per Hour</SelectItem>
                    <SelectItem value="SALARY">Salary</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  name="ratePerHour"
                  value={employeeData.ratePerHour}
                  onChange={handleChange}
                  placeholder="Rate Per Hour"
                />
                <Select
                  value={employeeData.payFrequency}
                  onValueChange={(value) =>
                    setEmployeeData((prev) => ({
                      ...prev,
                      payFrequency: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pay Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEK">Weekly</SelectItem>
                    <SelectItem value="MONTH">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Employee Type */}
            <section>
              <Select
                value={employeeData.employeeType}
                onValueChange={(value) =>
                  setEmployeeData((prev) => ({
                    ...prev,
                    employeeType: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      employeeType.find(
                        (et) => et._id === employeeData.employeeType
                      )?.employee_type || "Employee Type"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {employeeType.map((single) => (
                    <SelectItem key={single._id} value={single._id}>
                      {single.employee_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>

            {/* Allownce and Deduction */}
            <h3 className="text-MD font-bold text-center">
              Allownces and Deduction Details{" "}
            </h3>

            <section className="flex justify-around ">
              <div>
                <h3 className="text-MD font-bold">Allownces </h3>

                {allownce.map((single) => (
                  <div key={single._id}>
                    <label className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedAllownces.includes(single._id)}
                        onCheckedChange={() =>
                          handleSelectChange(single._id, "allownce")
                        }
                      />
                      <span>{single.allownce}</span>
                    </label>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-MD font-bold">Deductions </h3>
                {deduction.map((single) => (
                  <div key={single._id}>
                    <label className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedDeductions.includes(single._id)}
                        onCheckedChange={() =>
                          handleSelectChange(single._id, "deduction")
                        }
                      />
                      <span>{single.deduction}</span>
                    </label>
                  </div>
                ))}
              </div>
            </section>

            {/*Leaves */}

            <section>
              <h3 className="text-MD font-bold text-center">Leaves Details </h3>
              <div>
                <h3 className="text-MD font-bold">Leaves</h3>
                {leave.map((single) => (
                  <div key={single._id}>
                    <label className="flex items-center space-x-3">
                      <Checkbox
                        checked={employeeData.leaves.some(
                          (leave) => leave.leaveId === single._id
                        )}
                        onCheckedChange={() =>
                          handleLeaveCheckboxChange(single._id)
                        }
                      />
                      <span>{single.leave}</span>
                      {employeeData.leaves.some(
                        (leave) => leave.leaveId === single._id
                      ) && (
                        <Input
                          className="w-[160px]"
                          type="number"
                          min="0"
                          value={
                            employeeData.leaves.find(
                              (leave) => leave.leaveId === single._id
                            ).available
                          }
                          onChange={(e) =>
                            handleSelectLeaveChange(single._id, e.target.value)
                          }
                          placeholder="Number of Leaves"
                        />
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : employeeToEdit
                  ? "Update Employee"
                  : "Add Employee"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PopupForm;
