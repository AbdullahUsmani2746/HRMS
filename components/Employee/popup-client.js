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
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [banks, setBanks] = useState([]);

  const uniqueCities = useMemo(() => {
    return Array.from(new Set(cities.map((city) => city.name))).map((name) =>
      cities.find((city) => city.name === name)
    );
  }, [cities]);

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
      const response = await axios.get("/api/employees");
      const employees = response.data.data.filter(
        (emp) => emp.clientId === employeeData.clientId
      );

      const maxId = employees
        .map((emp) => parseInt(emp.employeeId.split("-EMP-")[1], 10))
        .reduce((max, current) => (current > max ? current : max), 0);

      const nextId = String(maxId + 1).padStart(3, "0");
      setEmployeeData((prev) => ({
        ...prev,
        // employeeId: `${clientId}-EMP-${nextId}`,
        employeeId: `CLIENT-001-EMP-${nextId}`,

      }));
    } catch (error) {
      console.error("Error generating employee ID:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
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
          <form onSubmit={handleSubmit} className="space-y-6 h-[65vh] overflow-y-auto">
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
              <Input
                name="jobTitle"
                value={employeeData.jobTitle}
                onChange={handleChange}
                placeholder="Job Title"
              />
              <Input
                name="department"
                value={employeeData.department}
                onChange={handleChange}
                placeholder="Department"
              />
              <Input
                name="paySchedule"
                value={employeeData.paySchedule}
                onChange={handleChange}
                placeholder="Pay Schedule"
              />
              <Input
                name="workLocation"
                value={employeeData.workLocation}
                onChange={handleChange}
                placeholder="Work Location"
              />
              <Input
                name="manager"
                value={employeeData.manager}
                onChange={handleChange}
                placeholder="Manager"
              />
              <Input
                name="costCenter"
                value={employeeData.costCenter}
                onChange={handleChange}
                placeholder="Cost Center"
              />
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
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
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
                  setEmployeeData((prev) => ({ ...prev, employeeType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Employee Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                </SelectContent>
              </Select>
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
