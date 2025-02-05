import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Country, State, City } from "country-state-city";
import { motion, AnimatePresence } from "framer-motion";
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X } from 'lucide-react';
import LoadingSpinner from "./spinner";

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.1 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  },
  item: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  }
};

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

  useEffect(() => {
    if (employerToEdit) {
      if (employerToEdit.country) {
        const statesList = State.getStatesOfCountry(employerToEdit.country) || [];
        setStates(statesList);
        const citiesInState = City.getCitiesOfState(employerToEdit.country, employerToEdit.state) || [];
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
      state: "",
      city: "",
    }));
    const statesList = State.getStatesOfCountry(value) || [];
    setStates(statesList);
    setCities([]);
  };

  const handleStateChange = (value) => {
    setNewEmployer((prev) => ({
      ...prev,
      state: value,
      city: "",
    }));
    const citiesInState = City.getCitiesOfState(newEmployer.country, value) || [];
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
    if (!newEmployer.cpPhoneNumber?.trim() || !phoneRegex.test(newEmployer.cpPhoneNumber))
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
        const response = await axios.put(`/api/employers/${employerToEdit._id}`, newEmployer);
        setEmployers((prev) => prev.map((emp) => emp._id === employerToEdit._id ? response.data.data : emp));
      } else {
        const response = await axios.post("/api/employers", newEmployer);
        setEmployers((prev) => [...prev, response.data.data]);
      }
      onClose();
    } catch (error) {
      console.error("Error saving employer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
        <motion.div variants={ANIMATION_VARIANTS.container} initial="hidden" animate="visible" exit="exit" className="w-full bg-foreground ">
          <Card className="bg-foreground border-foreground/10 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-background flex justify-between items-center">
                {employerToEdit ? "Edit Client" : "Add Client"}
                <Button variant="ghost" size="icon" onClick={onClose} className="text-background/60 hover:text-background">
                  <X className="w-5 h-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 px-1 h-[75vh] overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-6">
                      <div className="space-y-4 p-4 rounded-lg bg-background/5 border border-background/10">
                        <h3 className="text-lg font-semibold text-background">Business Information</h3>
                        <div className="space-y-4">
                          <Input type="text" name="businessName" value={newEmployer.businessName} onChange={handleChange} placeholder="Business Name" className="bg-background/5 border-background/10 text-background placeholder:text-background/40" required />
                          {errors.businessName && <p className="text-red-500 text-sm">{errors.businessName}</p>}

                          <Input type="email" name="email" value={newEmployer.email} onChange={handleChange} placeholder="Email" className="bg-background/5 border-background/10 text-background placeholder:text-background/40" required />
                          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

                          <Input type="text" name="address" value={newEmployer.address} onChange={handleChange} placeholder="Address" className="bg-background/5 border-background/10 text-background placeholder:text-background/40" required />
                          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}

                          <div className="grid grid-cols-3 gap-4">
                            <Select value={newEmployer.country} onValueChange={handleCountryChange}>
                              <SelectTrigger className="bg-background/5 border-background/10 text-background">
                                <SelectValue placeholder="Select Country" />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem key={country.isoCode} value={country.isoCode}>{country.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {states.length > 0 && (
                              <Select value={newEmployer.state} onValueChange={handleStateChange}>
                                <SelectTrigger className="bg-background/5 border-background/10 text-background">
                                  <SelectValue placeholder="Select State" />
                                </SelectTrigger>
                                <SelectContent>
                                  {states.map((state) => (
                                    <SelectItem key={state.isoCode} value={state.isoCode}>{state.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}

                            <Select value={newEmployer.city} onValueChange={handleCityChange}>
                              <SelectTrigger className="bg-background/5 border-background/10 text-background">
                                <SelectValue placeholder="Select City" />
                              </SelectTrigger>
                              <SelectContent>
                                {uniqueCities.map((city) => (
                                  <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 p-4 rounded-lg bg-background/5 border border-background/10">
                        <h3 className="text-lg font-semibold text-background">Contact Person Information</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <Input type="text" name="cpFirstName" value={newEmployer.cpFirstName} onChange={handleChange} placeholder="First Name" className="bg-background/5 border-background/10 text-background placeholder:text-background/40" required />
                          <Input type="text" name="cpMiddleName" value={newEmployer.cpMiddleName} onChange={handleChange} placeholder="Middle Name" className="bg-background/5 border-background/10 text-background placeholder:text-background/40" />
                          <Input type="text" name="cpSurname" value={newEmployer.cpSurname} onChange={handleChange} placeholder="Surname" className="bg-background/5 border-background/10 text-background placeholder:text-background/40" required />
                        </div>
                        {(errors.cpFirstName || errors.cpSurname) && (
                          <div className="space-y-1">
                            {errors.cpFirstName && <p className="text-red-500 text-sm">{errors.cpFirstName}</p>}
                            {errors.cpSurname && <p className="text-red-500 text-sm">{errors.cpSurname}</p>}
                          </div>
                        )}

                        <Input type="email" name="cpEmail" value={newEmployer.cpEmail} onChange={handleChange} placeholder="Email" className="bg-background/5 border-background/10 text-background placeholder:text-background/40" required />
                        {errors.cpEmail && <p className="text-red-500 text-sm">{errors.cpEmail}</p>}

                        <Input type="text" name="cpPhoneNumber" value={newEmployer.cpPhoneNumber} onChange={handleChange} placeholder="Phone Number" className="bg-background/5 border-background/10 text-background placeholder:text-background/40" required />
                        {errors.cpPhoneNumber && <p className="text-red-500 text-sm">{errors.cpPhoneNumber}</p>}

                        <Input type="text" name="cpAddress" value={newEmployer.cpAddress} onChange={handleChange} placeholder="Address" className="bg-background/5 border-background/10 text-background placeholder:text-background/40" />
                      </div>

                      <div className="space-y-4 p-4 rounded-lg bg-background/5 border border-background/10">
                      <h3 className="text-lg font-semibold text-background">Employer Details</h3>
                        <div className="space-y-4">
                          <Input
                            type="text"
                            name="employerId"
                            value={newEmployer.employerId}
                            readOnly
                            className="bg-background/5 border-background/10 text-background placeholder:text-background/40"
                            required
                          />
                          {errors.employerId && <p className="text-red-500 text-sm">{errors.employerId}</p>}

                          <Select
                            value={newEmployer.subscriptionPlan}
                            onValueChange={(value) => setNewEmployer((prev) => ({
                              ...prev,
                              subscriptionPlan: value,
                            }))}
                          >
                            <SelectTrigger className="bg-background/5 border-background/10 text-background">
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
                          {errors.subscriptionPlan && <p className="text-red-500 text-sm">{errors.subscriptionPlan}</p>}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <Select
                            value={newEmployer.status}
                            onValueChange={(value) => setNewEmployer((prev) => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger className="bg-background/5 border-background/10 text-background">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={newEmployer.paymentMethod}
                            onValueChange={(value) => setNewEmployer((prev) => ({ ...prev, paymentMethod: value }))}
                          >
                            <SelectTrigger className="bg-background/5 border-background/10 text-background">
                              <SelectValue placeholder="Payment Method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DIRECT DEPOSIT">Direct Deposit</SelectItem>
                              <SelectItem value="CHEQUE">Cheque</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={newEmployer.terms}
                            onValueChange={(value) => setNewEmployer((prev) => ({ ...prev, terms: value }))}
                          >
                            <SelectTrigger className="bg-background/5 border-background/10 text-background">
                              <SelectValue placeholder="Terms" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MONTHLY">Monthly</SelectItem>
                              <SelectItem value="YEARLY">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-4 border-t border-background/10">
                        <Button
                          type="button"
                          onClick={onClose}
                          variant="outline"
                          className="border-background/10 text-background hover:bg-background/5"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-background text-foreground hover:bg-background/90"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSubmitting ? "Saving..." : employerToEdit ? "Update Client" : "Add Client"}
                        </Button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default PopupForm;