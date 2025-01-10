import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Country, State, City } from "country-state-city";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import LoadingSpinner from "./spinner";

const PopupForm = ({ onClose, setEmployers, employerToEdit }) => {
  const [newEmployer, setNewEmployer] = useState({
    businessName: "",
    email: "",
    address: "",
    city: "",
    state:"",
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  const uniqueCities = useMemo(() => {
    return Array.from(new Set(cities.map((city) => city.name))).map((name) =>
      cities.find((city) => city.name === name)
    );
  }, [cities]);

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/subscriptionPlanMaster");
        setSubscriptionPlans(response.data.data);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscriptionPlans();
  }, []);

  // And replace the useEffect for employerToEdit with this:
  useEffect(() => {
    if (employerToEdit) {
      // Use the country code directly
      if (employerToEdit.country) {
        const statesList = State.getStatesOfCountry(employerToEdit.country) || [];
        setStates(statesList);
  
        // Fetch cities based on the employer's state
        const citiesInState =
          City.getCitiesOfState(employerToEdit.country, employerToEdit.state) || [];
        setCities(citiesInState);
      }
      setNewEmployer(employerToEdit);
    } else {
      generateEmployerId();
    }
  }, [employerToEdit]);
  

  const handleCountryChange = (value) => {
    setNewEmployer((prev) => ({
      ...prev,
      country: value,
      state: "", // Reset state when country changes
      city: "", // Reset city when country changes
    }));

    const statesList = State.getStatesOfCountry(value) || [];
    setStates(statesList);

    setCities([]);


   
  };

  const handleStateChange = (value) => {
    setNewEmployer((prev) => ({
      ...prev,
      state: value,
      city: "", // Reset city when state changes
    }));

    const citiesInState =
      City.getCitiesOfState(newEmployer.country, value) || [];
    setCities(citiesInState);
  };

  const handleCityChange = (value) => {
    setNewEmployer((prev) => ({
      ...prev,
      city: value,
    }));
  };

  const generateEmployerId = async () => {
    try {
      const response = await axios.get("/api/employers");
      const employers = response.data.data;
      const maxId = employers
        .filter((emp) => emp.employerId?.startsWith("CLIENT-"))
        .map((emp) => parseInt(emp.employerId.split("-")[1]) || 0)
        .reduce((max, current) => Math.max(max, current), 0);

      const nextId = maxId + 1;
      setNewEmployer((prev) => ({
        ...prev,
        employerId: `CLIENT-${String(nextId).padStart(3, "0")}`,
      }));
    } catch (error) {
      console.error("Error generating employer ID:", error);
      // Set a fallback ID in case of error
      setNewEmployer((prev) => ({
        ...prev,
        employerId: `CLIENT-${Date.now()}`,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEmployer((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const validationErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;

    if (!newEmployer.businessName?.trim())
      validationErrors.businessName = "Business name is required.";
    if (!newEmployer.email?.trim() || !emailRegex.test(newEmployer.email))
      validationErrors.email = "Valid email is required.";
    if (!newEmployer.address?.trim())
      validationErrors.address = "Address is required.";
    if (!newEmployer.city?.trim()) validationErrors.city = "City is required.";
    if (!newEmployer.country?.trim())
      validationErrors.country = "Country is required.";
    if (!newEmployer.cpFirstName?.trim())
      validationErrors.cpFirstName = "First name is required.";
    if (!newEmployer.cpSurname?.trim())
      validationErrors.cpSurname = "Surname is required.";
    if (!newEmployer.cpEmail?.trim() || !emailRegex.test(newEmployer.cpEmail))
      validationErrors.cpEmail = "Valid email is required.";
    if (
      !newEmployer.cpPhoneNumber?.trim() ||
      !phoneRegex.test(newEmployer.cpPhoneNumber)
    )
      validationErrors.cpPhoneNumber = "Valid phone number is required.";
    if (!newEmployer.subscriptionPlan?.trim())
      validationErrors.subscriptionPlan = "Subscription plan is required.";

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (employerToEdit?._id) {
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
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {employerToEdit ? "Edit Client" : "Add Client"}
          </DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 max-h-[65vh] overflow-y-auto"
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
                onValueChange={handleCountryChange}>
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

                {states.length > 0 && (
                  <Select 
                  value={newEmployer.state}
                  onValueChange={handleStateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.isoCode} value={state.isoCode}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select 
                value={newEmployer.city}
                onValueChange={handleCityChange}>
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
              <Button type="button" onClick={onClose} variant="secondary">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : employerToEdit
                  ? "Update Client"
                  : "Add Client"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PopupForm;
