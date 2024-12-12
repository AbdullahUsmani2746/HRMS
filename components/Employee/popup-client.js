import { useState, useEffect, useMemo } from "react";
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

const PopupForm = ({ onClose, setEmployees, employeeToEdit, clientId }) => {
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
    clientId: clientId || "CLIENT-001", // Default client ID
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
    allownces:[],
    deductions:[]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [costCenter, setcostCenter] = useState([]);
  const [department, setDepartment] = useState([]);
  const [location, setlocation] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [allownce, setAllownce] = useState([]);
  const [deduction, setDeduction] = useState([]);
  const [jobTitle, setJobTitle] = useState([]);
  const [employeeType, setEmployeeType] = useState([]);
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedAllownces, setselectedAllownces] = useState([]);
  const [selectedDeductions, setselectedDeductions] = useState([]);

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
      ] = await Promise.all([
        axios.get("/api/employees/costCenter"),
        axios.get("/api/employees/department"),
        axios.get("/api/employees/schedule"),
        axios.get("/api/employees/workLocation"),
        axios.get("/api/employees/deduction"),
        axios.get("/api/employees/allownce"),
        axios.get("/api/employees/jobTitle"),
        axios.get("/api/employees/employeeType"),
      ]);

      setcostCenter(costRepsonse.data.data);
      setDepartment(depResponse.data.data);
      setSchedule(scheduleResponse.data.data);
      setlocation(locationResponse.data.data);
      setAllownce(allownceResponse.data.data);
      setDeduction(deductionResponse.data.data);
      setJobTitle(jobTitleResponse.data.data);
      setEmployeeType(employeeTypeResponse.data.data);
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
    setCountries(Country.getAllCountries());
    fetchBanks();
  }, []);

  useEffect(() => {
    if (employeeToEdit) {
      const countryISOCode = Country.getCountryByCode(
        employeeToEdit.country
      )?.isoCode;
      if (countryISOCode) {
        setCities(City.getCitiesOfCountry(countryISOCode));
      }
      setEmployeeData(employeeToEdit);
    } else {
      generateEmployeeId();
    }
  }, [employeeToEdit]);

  const fetchBanks = async () => {
    try {
      const response = await axios.get("https://api.example.com/banks"); // Replace with a real bank API
      setBanks(response.data.banks); // Assume `banks` is the key in the API response
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

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
  }};
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

    setIsSubmitting(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (employeeToEdit) {
        const response = await axios.put(
          `/api/employees/${employeeToEdit._id}`,
          employeeData
        );
        setEmployees((prev) =>
          prev.map((emp) =>
            emp._id === employeeToEdit._id ? response.data.data : emp
          )
        );
      } else {
        const response = await axios.post("/api/employees", employeeData);
        setEmployees((prev) => [...prev, response.data.data]);
      }
      onClose();
    } catch (error) {
      console.error("Error saving employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleSelectedChange = (id) => {
  //   console.log(selected);
  //   setselected((prev) =>
  //     prev.includes(id) ? prev.filter((id) => id !== id) : [...prev, id]
  //   );
  // };

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
            className="space-y-6 h-[65vh] overflow-y-auto"
          >
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
                  <SelectValue placeholder="Job Title" />
                </SelectTrigger>
                <SelectContent>
                  {jobTitle.map((single) => (
                    <SelectItem key={single._id} value={single.job_title}>
                      {single.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {department.map((single) => (
                    <SelectItem key={single._id} value={single.department}>
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
                  <SelectValue placeholder="Pay Schedule" />
                </SelectTrigger>
                <SelectContent>
                  {schedule.map((single) => (
                    <SelectItem key={single._id} value={single.pay_schedule}>
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
                  <SelectValue placeholder="Work Location" />
                </SelectTrigger>
                <SelectContent>
                  {location.map((single) => (
                    <SelectItem key={single._id} value={single.work_location}>
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
                  <SelectValue placeholder="Cost Center" />
                </SelectTrigger>
                <SelectContent>
                  {costCenter.map((single) => (
                    <SelectItem key={single._id} value={single.cost_center}>
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
                    <SelectItem value="DIRECT DEPOSIT">Direct Deposit</SelectItem>
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
                  <SelectValue placeholder="Employee Type" />
                </SelectTrigger>
                <SelectContent>
                  {employeeType.map((single) => (
                    <SelectItem key={single._id} value={single.employee_type}>
                      {single.employee_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>

            {/* Allownce and Deduction */}
            <h3 className="text-MD font-bold">
              Allownces and Deduction Details{" "}
            </h3>

            <section className="flex justify-between  items-left ">
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
