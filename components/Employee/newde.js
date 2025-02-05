import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Country, City } from "country-state-city";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertCircle, Upload, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LoadingSpinner from "@/components/spinner";
import Image from "next/image";

const TabGroup = ({ label, children, error }) => (
  <div className="space-y-2">
    <div className="flex items-center">
      <h3 className="text-lg font-semibold">{label}</h3>
      {error && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-2 text-red-500 flex items-center"
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}
    </div>
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-foreground/10">
      {children}
    </div>
  </div>
);

const FormField = ({ label, error, children }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium">{label}</label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-red-500 text-xs"
        >
          {error}
        </motion.span>
      )}
    </AnimatePresence>
  </div>
);

const PopupForm = ({ onClose, setEmployees, employeeToEdit }) => {
  // [Previous state declarations remain the same]
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
    manager: null,
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
  const [manager, setManager] = useState([]);
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
          manResponse,
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
          axios.get(`/api/employees/manager?employerId=${clientId}`),
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
        setManager(manResponse.data.data);
  
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

  const scrollToError = (errors) => {
    const firstError = Object.keys(errors)[0];
    const element = document.getElementsByName(firstError)[0];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const validateForm = () => {
    const validationErrors = {};
    if (!employeeData.firstName.trim()) validationErrors.firstName = "First name is required";
    if (!employeeData.surname.trim()) validationErrors.surname = "Surname is required";
    if (!employeeData.emailAddress.trim()) {
      validationErrors.emailAddress = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeData.emailAddress)) {
      validationErrors.emailAddress = "Invalid email format";
    }
    if (!employeeData.phoneNumber.trim()) {
      validationErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(employeeData.phoneNumber.replace(/\D/g, ''))) {
      validationErrors.phoneNumber = "Invalid phone number format";
    }
    
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
      <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-lg border-foreground/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {employeeToEdit ? "Edit Employee" : "Add Employee"}
            </motion.div>
          </DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-foreground/5">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="employment">Employment</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                   {/* Profile Image Section */}
                   <TabGroup label="Profile Image">
                    <div className="max-w-sm mx-auto">
                      <div className="relative w-32 h-32 mx-auto mb-4 group">
                        {profileImage || employeeData.profileImage ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative"
                          >
                            <Image
                              src={profileImage ? URL.createObjectURL(profileImage) : employeeData.profileImage}
                              width={128}
                              height={128}
                              alt="Profile Preview"
                              className="rounded-full object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <label className="cursor-pointer text-white">
                                <Upload className="w-6 h-6" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(e, "profileImage")}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="flex items-center justify-center w-full h-full rounded-full bg-foreground/5 text-foreground/40">
                            <label className="cursor-pointer">
                              <Upload className="w-8 h-8" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, "profileImage")}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabGroup>

                          {/* Personal Details Section */}
                          <TabGroup label="Personal Information">
                    <div className="grid grid-cols-3 gap-4">
                      <FormField label="First Name" error={errors.firstName}>
                        <Input
                          name="firstName"
                          value={employeeData.firstName}
                          onChange={handleChange}
                          placeholder="First Name"
                          className={errors.firstName ? "border-red-500" : ""}
                        />
                      </FormField>

                      <FormField label="Middle Name">
                        <Input
                          name="middleName"
                          value={employeeData.middleName}
                          onChange={handleChange}
                          placeholder="Middle Name"
                        />
                      </FormField>

                      <FormField label="Surname" error={errors.surname}>
                        <Input
                          name="surname"
                          value={employeeData.surname}
                          onChange={handleChange}
                          placeholder="Surname"
                          className={errors.surname ? "border-red-500" : ""}
                        />
                      </FormField>

                      <FormField label="Date of Birth">
                        <Input
                          type="date"
                          name="dob"
                          value={employeeData.dob}
                          onChange={handleChange}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </FormField>

                      <FormField label="Gender">
                        <Select
                          value={employeeData.gender}
                          onValueChange={(value) =>
                            setEmployeeData((prev) => ({ ...prev, gender: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>

                      <FormField label="Village">
                        <Input
                          name="village"
                          value={employeeData.village}
                          onChange={handleChange}
                          placeholder="Village"
                        />
                      </FormField>
                    </div>
                  </TabGroup>
 {/* Contact Details */}
 <TabGroup label="Contact Information">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Phone Number" error={errors.phoneNumber}>
                        <Input
                          name="phoneNumber"
                          value={employeeData.phoneNumber}
                          onChange={handleChange}
                          placeholder="Phone Number"
                          className={errors.phoneNumber ? "border-red-500" : ""}
                        />
                      </FormField>

                      <FormField label="Email Address" error={errors.emailAddress}>
                        <Input
                          name="emailAddress"
                          value={employeeData.emailAddress}
                          onChange={handleChange}
                          placeholder="Email Address"
                          className={errors.emailAddress ? "border-red-500" : ""}
                        />
                      </FormField>
                    </div>
                  </TabGroup>
                </motion.div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabGroup label="Document Upload">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-foreground/20 rounded-lg p-4 text-center">
                        <label className="cursor-pointer block">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-foreground/40" />
                          <span className="text-sm text-foreground/60">Drop files here or click to upload</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            multiple
                            onChange={(e) => handleFileChange(e, "documents")}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="space-y-2">
                        {(uploadDocument.length > 0 ? uploadDocument : employeeData.documents).map((doc, index) => (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={index}
                            className="flex items-center justify-between bg-foreground/5 p-3 rounded-lg"
                          >
                            <div className="flex-1 space-y-1">
                              <div className="text-sm font-medium">{doc.name}</div>
                              <Input
                                type="text"
                                placeholder="Enter description"
                                value={doc.description}
                                onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(index)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabGroup>
                </motion.div>
              </TabsContent>

              <TabsContent value="employment" className="space-y-6 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Employee ID Section */}
                  <TabGroup label="Employee Identification">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Employee ID">
                        <Input
                          name="employeeId"
                          value={employeeData.employeeId}
                          readOnly
                          className="bg-foreground/5"
                        />
                      </FormField>

                      <FormField label="Client ID">
                        <Input
                          name="clientId"
                          value={employeeData.clientId}
                          readOnly
                          className="bg-foreground/5"
                        />
                      </FormField>
                    </div>
                  </TabGroup>

                  {/* Job Details Section */}
                  <TabGroup label="Job Information">
                    <div className="grid grid-cols-3 gap-4">
                      <FormField label="Hire Date">
                        <Input
                          type="date"
                          name="hireDate"
                          value={employeeData.hireDate}
                          onChange={handleChange}
                        />
                      </FormField>

                      <FormField label="Job Title">
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
                            <SelectValue placeholder="Select Job Title" />
                          </SelectTrigger>
                          <SelectContent>
                            {jobTitle.map((single) => (
                              <SelectItem key={single._id} value={single._id}>
                                {single.job_title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>

                      <FormField label="Department">
                        <Select
                          value={employeeData.department}
                          onValueChange={(value) =>
                            setEmployeeData((prev) => ({
                              ...prev,
                              department: value,
                            }))
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
                      </FormField>

                      <FormField label="Work Location">
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
                            <SelectValue placeholder="Select Work Location" />
                          </SelectTrigger>
                          <SelectContent>
                            {location.map((single) => (
                              <SelectItem key={single._id} value={single._id}>
                                {single.work_location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>

                      <FormField label="Manager">
                        <Select
                          value={employeeData.manager}
                          onValueChange={(value) =>
                            setEmployeeData((prev) => ({
                              ...prev,
                              manager: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Manager" />
                          </SelectTrigger>
                          <SelectContent>
                            {manager.map((single) => (
                              <SelectItem key={single._id} value={single._id}>
                                {single.manager}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>

                      <FormField label="Cost Center">
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
                            <SelectValue placeholder="Select Cost Center" />
                          </SelectTrigger>
                          <SelectContent>
                            {costCenter.map((single) => (
                              <SelectItem key={single._id} value={single._id}>
                                {single.cost_center}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>
                  </TabGroup>
                </motion.div>
              </TabsContent>

              <TabsContent value="payment" className="space-y-6 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                    <TabGroup  label="Payment Information">
                    <div className="grid grid-cols-3 gap-4">
                        <FormField label="Payment Method">
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
                    <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="CHEQUE">Cheque</SelectItem>
                      <SelectItem value="DIRECT DEPOSIT">
                        Direct Deposit
                      </SelectItem>
                    </SelectContent>
                  </Select>
                        </FormField>

                        <FormField label="Bank Name">
                        <Input
                    name="bankName"
                    value={employeeData.bankName}
                    onChange={handleChange}
                    placeholder="Bank Name"
                  />
                        </FormField>

                        <FormField label="Account Name">
                        <Input
                    name="accountName"
                    value={employeeData.accountName}
                    onChange={handleChange}
                    placeholder="Account Name"
                  />
                        </FormField>

                        <FormField label="Account Number">
                        <Input
                    name="accountNumber"
                    value={employeeData.accountNumber}
                    onChange={handleChange}
                    placeholder="Account Number"
                  />
                        </FormField>

                        <FormField label="Pay Type">
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
                        </FormField>
                        <FormField label="Rate Per Hour">
                        <Input
                    name="ratePerHour"
                    value={employeeData.ratePerHour}
                    onChange={handleChange}
                    placeholder="Rate Per Hour"
                  />
                        </FormField>
                        <FormField label="Pay Frequency">
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
                        </FormField>

                        <FormField label="Employee Type">
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
                        </FormField>
</div>
                    </TabGroup>
                </motion.div>
              </TabsContent>

              <TabsContent value="benefits" className="space-y-6 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* [Previous benefits sections wrapped in TabGroup] */}
                  <TabGroup label="Benefits and Deducitons">
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

              <h3 className="text-sm font-bold text-center bg-foreground text-white p-2">Leaves Details </h3>
              <div className="mt-3">
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

                  </TabGroup>
                </motion.div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="hover:bg-foreground/5"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                {isSubmitting ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center"
                  >
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Saving...
                  </motion.div>
                ) : (
                  employeeToEdit ? "Update Employee" : "Add Employee"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PopupForm;