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
} from "@/components/ui/dialog"; // Assuming these are Shadcn UI dialog components
import { Button } from "@/components/ui/button"; // Assuming the Shadcn UI button component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // Assuming the Shadcn UI button component

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
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  const uniqueCities = Array.from(new Set(cities.map((city) => city.name))).map(
    (name) => cities.find((city) => city.name === name)
  );

  console.log(employerToEdit.city);
  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    // Fetch subscription plans from the server
    const fetchSubscriptionPlans = async () => {
      try {
        const response = await axios.get("/api/subscriptionPlanMaster");
        console.log(response.data.data);
        setSubscriptionPlans(response.data.data);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
      }
    };
    fetchSubscriptionPlans();
  }, []);

  const handleCountryChange = (value) => {
    const selectedCountry = value;
    const countryISOCode = Country.getCountryByCode(selectedCountry)?.isoCode;

    setNewEmployer((prevEmployer) => ({
      ...prevEmployer,
      country: selectedCountry,
      city:
        prevEmployer.city && countryISOCode === prevEmployer.country
          ? prevEmployer.city
          : "", // Retain city if valid, otherwise reset
    }));

    if (countryISOCode) {
      setCities(City.getCitiesOfCountry(countryISOCode));
    }
  };

  useEffect(() => {
    if (employerToEdit) {
      const countryISOCode = Country.getCountryByCode(
        employerToEdit.country
      )?.isoCode;
      if (countryISOCode) {
        setCities(City.getCitiesOfCountry(countryISOCode));
      }
      setNewEmployer(employerToEdit);
    }
  }, [employerToEdit]);

  const handleChange = (e) => {
    setNewEmployer({
      ...newEmployer,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (employerToEdit) {
      setNewEmployer(employerToEdit);
    }
  }, [employerToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (employerToEdit) {
        // Update existing employer
        const response = await axios.put(
          `/api/employers/${employerToEdit._id}`,
          newEmployer
        );
        setEmployers((prevEmployers) =>
          prevEmployers.map((emp) =>
            emp._id === employerToEdit._id ? response.data.data : emp
          )
        );
      } else {
        // Create new employer
        const response = await axios.post("/api/employers", newEmployer);
        setEmployers((prevEmployers) => [...prevEmployers, response.data.data]);
      }
      onClose();
    } catch (error) {
      console.error("Error saving employer:", error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Employer</DialogTitle>
          <DialogClose onClick={onClose}>
            {/* <XCircleIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" /> */}
          </DialogClose>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-4  max-h-[80vh] overflow-y-auto p-3"
        >
          <h3 className="text-xl font-semibold mt-4 mb-2">
            Business Information
          </h3>
          <div className="flex flex-wrap gap-4 md:flex-nowrap">
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
          </div>
          <Input
            type="text"
            name="address"
            value={newEmployer.address}
            onChange={handleChange}
            placeholder="Address"
            required
          />
          <div className="flex flex-wrap gap-4">
            <Select
              value={newEmployer.country}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country, index) => (
                  <SelectItem
                    key={`${country.isoCode}-${index}`}
                    value={country.isoCode}
                  >
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              name="city"
              value={newEmployer.city}
              onValueChange={(value) =>
                setNewEmployer({ ...newEmployer, city: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCities.map((city, index) => (
                  <SelectItem key={`${city.name}-${index}`} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <h3 className="text-xl font-semibold mt-4 mb-2">
            Contact Person Information
          </h3>
          <div className="flex flex-wrap gap-4">
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
              placeholder="Middle Name (Optional)"
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
          <div className="flex flex-wrap gap-4">
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
          </div>
          <Input
            type="text"
            name="cpAddress"
            value={newEmployer.cpAddress}
            onChange={handleChange}
            placeholder="Address"
          />
          <h3 className="text-xl font-semibold mt-4 mb-2">Employer Details</h3>
          <div className="flex flex-wrap gap-4">
            <Input
              type="text"
              name="employerId"
              value={newEmployer.employerId}
              onChange={handleChange}
              placeholder="Employer ID"
              required
            />
            <Select
              value={newEmployer.subscriptionPlan}
              onValueChange={(value) =>
                setNewEmployer({ ...newEmployer, subscriptionPlan: value })
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
          </div>
          <div className="flex flex-wrap gap-4">
            <Select
              name="status"
              value={newEmployer.status}
              onValueChange={(value) =>
                setNewEmployer({ ...newEmployer, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 min-w-[200px]">
              <label className="block font-semibold">Payment Method:</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="DIRECT DEPOSIT"
                    checked={newEmployer.paymentMethod === "DIRECT DEPOSIT"}
                    onChange={handleChange}
                    className="form-radio"
                  />
                  <span className="ml-2">Direct Deposit</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CHEQUE"
                    checked={newEmployer.paymentMethod === "CHEQUE"}
                    onChange={handleChange}
                    className="form-radio"
                  />
                  <span className="ml-2">Cheque</span>
                </label>
              </div>
            </div>
          </div>
          <Select
            name="terms"
            value={newEmployer.terms}
            onValueChange={(value) =>
              setNewEmployer({ ...newEmployer, terms: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">MONTHLY</SelectItem>
              <SelectItem value="ANNUAL">ANNUAL</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PopupForm;
