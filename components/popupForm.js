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
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);  // State to track form submission
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  const uniqueCities = useMemo(() => {
    return Array.from(new Set(cities.map((city) => city.name))).map((name) =>
      cities.find((city) => city.name === name)
    );
  }, [cities]); // Only recomputes when cities change

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setIsLoading(true); // Start loading
        const response = await axios.get("/api/subscriptionPlanMaster");
        setSubscriptionPlans(response.data.data);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };
    fetchSubscriptionPlans();
  }, []);

  useEffect(() => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEmployer((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error when input changes
  };

  const validateForm = () => {
    const validationErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!newEmployer.businessName.trim())
      validationErrors.businessName = "Business name is required.";
    if (!newEmployer.email.trim() || !emailRegex.test(newEmployer.email))
      validationErrors.email = "Valid email is required.";
    if (!newEmployer.address.trim())
      validationErrors.address = "Address is required.";
    if (!newEmployer.city.trim()) validationErrors.city = "City is required.";
    if (!newEmployer.country.trim())
      validationErrors.country = "Country is required.";
    if (!newEmployer.cpFirstName.trim())
      validationErrors.cpFirstName = "First name is required.";
    if (!newEmployer.cpSurname.trim())
      validationErrors.cpSurname = "Surname is required.";
    if (!newEmployer.cpEmail.trim() || !emailRegex.test(newEmployer.cpEmail))
      validationErrors.cpEmail = "Valid email is required.";
    if (!newEmployer.cpPhoneNumber.trim())
      validationErrors.cpPhoneNumber = "Phone number is required.";
    if (!newEmployer.subscriptionPlan.trim())
      validationErrors.subscriptionPlan = "Subscription plan is required.";
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

      // Start submission process
  setIsSubmitting(true);


    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

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
    }
    finally {
      // End submission process
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {employerToEdit ? "Edit Client" : "Add Client"}
          </DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-[65vh]">
            Loading...
          </div> // Loading screen
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 h-[65vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold">Business Information</h3>
            <div className="space-y-4">
              <Input
                type="text"
                name="businessName"
                value={newEmployer.businessName}
                onChange={handleChange}
                placeholder="Business Name"
                required
              />
              {errors.businessName && (
                <p className="text-red-500">{errors.businessName}</p>
              )}

              <Input
                type="email"
                name="email"
                value={newEmployer.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
              {errors.email && <p className="text-red-500">{errors.email}</p>}

              <Input
                type="text"
                name="address"
                value={newEmployer.address}
                onChange={handleChange}
                placeholder="Address"
                required
              />
              {errors.address && (
                <p className="text-red-500">{errors.address}</p>
              )}

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
                {errors.country && (
                  <p className="text-red-500">{errors.country}</p>
                )}

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
                {errors.city && <p className="text-red-500">{errors.city}</p>}
              </div>
            </div>

            <h3 className="text-lg font-semibold">
              Contact Person Information
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <Input
                type="text"
                name="cpFirstName"
                value={newEmployer.cpFirstName}
                onChange={handleChange}
                placeholder="First Name"
                required
              />
              {errors.cpFirstName && (
                <p className="text-red-500 col-span-3">{errors.cpFirstName}</p>
              )}

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
              {errors.cpSurname && (
                <p className="text-red-500 col-span-3">{errors.cpSurname}</p>
              )}
            </div>

            <Input
              type="email"
              name="cpEmail"
              value={newEmployer.cpEmail}
              onChange={handleChange}
              placeholder="Email"
              required
            />
            {errors.cpEmail && <p className="text-red-500">{errors.cpEmail}</p>}

            <Input
              type="text"
              name="cpPhoneNumber"
              value={newEmployer.cpPhoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              required
            />
            {errors.cpPhoneNumber && (
              <p className="text-red-500">{errors.cpPhoneNumber}</p>
            )}

            <Input
              type="text"
              name="cpAddress"
              value={newEmployer.cpAddress}
              onChange={handleChange}
              placeholder="Address"
            />
            {errors.cpAddress && (
              <p className="text-red-500">{errors.cpAddress}</p>
            )}

            <h3 className="text-lg font-semibold">Employer Details</h3>
            <div className="space-y-4">
              <Input
                type="text"
                name="employerId"
                value={newEmployer.employerId}
                readOnly
                placeholder={newEmployer.employerId}
                required
              />
              {errors.employerId && (
                <p className="text-red-500">{errors.employerId}</p>
              )}

              <Select
                value={newEmployer.subscriptionPlan}
                onValueChange={(value) =>
                  setNewEmployer((prev) => ({
                    ...prev,
                    subscriptionPlan: value,
                  }))
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
              {errors.subscriptionPlan && (
                <p className="text-red-500">{errors.subscriptionPlan}</p>
              )}
            </div>

            {/* Additional fields for Status, Payment Method, and Terms */}
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
              {errors.status && <p className="text-red-500">{errors.status}</p>}

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
              {errors.paymentMethod && (
                <p className="text-red-500">{errors.paymentMethod}</p>
              )}

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
              {errors.terms && <p className="text-red-500">{errors.terms}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <Button onClick={onClose} variant="secondary">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting
                  ? "Saving..."
                  : employerToEdit
                  ? "Update Client"
                  : "Add Client"}
              </Button>{" "}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PopupForm;
