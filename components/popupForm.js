import { useState, useEffect } from "react";
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

const PopupForm = ({ onClose, setEmployers, employerToEdit }) => {
  const [newEmployer, setNewEmployer] = useState({
    businessName: "",
    email: "",
    address: "",
    city: "",
    country: "",
    cpFirstName: "",
    cpMiddleName: "",
    cpSurname: "",
    cpEmail: "",
    cpPhoneNumber: "",
    cpAddress: "",
    employerId: "",
    subscriptionPlan: "",
    status: "ACTIVE",
    paymentMethod: "DIRECT DEPOSIT",
    terms: "MONTHLY",
  });

  console.log(newEmployer);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [error, setError] = useState(null);

  const uniqueCities = Array.from(new Set(cities.map((city) => city.name))).map(
    (name) => cities.find((city) => city.name === name)
  );

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        const response = await axios.get("/api/subscriptionPlanMaster");
        setSubscriptionPlans(response.data.data);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
      }
    };
    fetchSubscriptionPlans();
  }, []);

  useEffect(() => {
    console.log(employerToEdit)
    if (employerToEdit) {
      const countryISOCode = Country.getCountryByCode(
        employerToEdit.country
      )?.isoCode;
      if (countryISOCode) {
        setCities(City.getCitiesOfCountry(countryISOCode));
      }
      setNewEmployer(employerToEdit);
    } else {
      generateEmployerId();
    }
  }, [employerToEdit]);

  const handleCountryChange = (value) => {
    const countryISOCode = Country.getCountryByCode(value)?.isoCode;
    setNewEmployer((prev) => ({
      ...prev,
      country: value,
      city: countryISOCode === prev.country ? prev.city : "",
    }));

    if (countryISOCode) {
      setCities(City.getCitiesOfCountry(countryISOCode));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target; // Extract only the name and value
    console.log(name,value)
    setNewEmployer({
      ...newEmployer,
      [name]: value,
    });
    console.log(newEmployer)
  };

  const generateEmployerId = async () => {
    try {
      const response = await axios.get("/api/employers");
      const employers = response.data.data;
      const maxId = employers
        .filter((emp) => emp.employerId.startsWith("CLIENT-"))
        .map((emp) => parseInt(emp.employerId.split("-")[1]))
        .reduce((max, current) => (current > max ? current : max), 0);

      const nextId = maxId + 1;
      setNewEmployer((prev) => ({
        ...prev,
        employerId: `CLIENT-${String(nextId).padStart(3, "0")}`,
      }));
    } catch (error) {
      console.error("Error generating employer ID:", error);
      setError("Failed to generate employer ID. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    console.log("New Employer Data:", newEmployer);
    try {
      if (employerToEdit) {
        const response = await axios.put(
          `/api/employers/${employerToEdit._id}`,
          newEmployer
        );
        setEmployers((prev) =>
          prev.map((emp) =>
            emp._id === employerToEdit._id ? response.data.data : emp
          )
        );
      } else {
        const response = await axios.post("/api/employers", newEmployer);
        setEmployers((prev) => [...prev, response.data.data]);
      }
      onClose();
    } catch (error) {
      console.error("Error saving employer:", error);
      setError("Failed to save employer. Please check your input.");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{employerToEdit ? "Edit Client" : "Add Client"}</DialogTitle>
          <DialogClose onClick={onClose} /> 
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-4 h-[65vh] overflow-y-auto">
          {error && <p className="text-red-500">{error}</p>}
          <h3 className="text-lg font-semibold">Business Information</h3>
          <Input
            type="text"
            name="businessName"
            value={newEmployer.businessName}
            onChange={handleChange}
            placeholder="Business Name"
            required
          />
          <Input
            type="email"
            name="email"
            value={newEmployer.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <Input
            type="text"
            name="address"
            value={newEmployer.address}
            onChange={handleChange}
            placeholder="Address"
            required
          />
          <div className="flex gap-4">
            <Select
              value={newEmployer.country}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={newEmployer.city}
              onValueChange={(value) =>
                setNewEmployer((prev) => ({ ...prev, city: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCities.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <h3 className="text-lg font-semibold">Contact Person Information</h3>
          <div className="grid grid-cols-3 gap-4">
            <Input
              type="text"
              name="cpFirstName"
              value={newEmployer.cpFirstName}
              onChange={handleChange}
              placeholder="First Name"
              required
            />
            <Input
              type="text"
              name="cpMiddleName"
              value={newEmployer.cpMiddleName}
              onChange={handleChange}
              placeholder="Middle Name"
            />
            <Input
              type="text"
              name="cpSurname"
              value={newEmployer.cpSurname}
              onChange={handleChange}
              placeholder="Surname"
              required
            />
          </div>
          <Input
            type="email"
            name="cpEmail"
            value={newEmployer.cpEmail}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <Input
            type="text"
            name="cpPhoneNumber"
            value={newEmployer.cpPhoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            required
          />
          <Input
            type="text"
            name="cpAddress"
            value={newEmployer.cpAddress}
            onChange={handleChange}
            placeholder="Address"
          />
          <h3 className="text-lg font-semibold">Clients Details</h3>
          <Input
            type="text"
            name="employerId"
            value={newEmployer.employerId}
            readOnly
            placeholder={newEmployer.employerId}
            required
          />
          <Select
            value={newEmployer.subscriptionPlan}
            onValueChange={(value) =>
              setNewEmployer((prev) => ({ ...prev, subscriptionPlan: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Subscription Plan" />
            </SelectTrigger>
            <SelectContent>
              {subscriptionPlans.map((plan) => (
                <SelectItem key={plan._id} value={plan._id}>
                  {plan.planName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-4">
            <Select
              value={newEmployer.status}
              onValueChange={(value) =>
                setNewEmployer((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={newEmployer.paymentMethod}
              onValueChange={(value) =>
                setNewEmployer((prev) => ({ ...prev, paymentMethod: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DIRECT DEPOSIT">Direct Deposit</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={newEmployer.terms}
              onValueChange={(value) =>
                setNewEmployer((prev) => ({ ...prev, terms: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex justify-end space-x-4">
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit">Save Employer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PopupForm;
