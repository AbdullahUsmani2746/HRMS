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
import Image from "next/image";
import { SelectGroup, SelectLabel } from "@radix-ui/react-select";

import { motion } from "framer-motion";

import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  Phone, 
  Mail, 
  Briefcase, 
  CreditCard, 
  FileText, 
  Image as ImageIcon, 
  Calendar,
  X 
} from "lucide-react";

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
    }
  }
};

const EmployeeFormDialog = ({
  employeeToEdit,
  onClose,
  handleSubmit,
  employeeData,
  setEmployeeData,
  handleChange,
  handleFileChange,
  profileImage,
  isLoading,
  isSubmitting,
  jobTitle,
  department,
  location,
  manager,
  costCenter,
  employeeType,
  allownce,
  deduction,
  leave,
  selectedAllownces,
  selectedDeductions,
  uploadDocument,
  handleDescriptionChange,
  removeDocument,
  handleSelectChange,
  handleLeaveCheckboxChange,
  handleSelectLeaveChange
}) => {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-foreground  max-w-full md:max-w-4xl p-0 h-[90vh] md:h-auto">
        <DialogHeader className="bg-foreground text-background p-3 md:p-4 rounded-t-lg flex flex-row justify-between">
          <DialogTitle className="text-xl md:text-2xl font-bold">
            {employeeToEdit ? "Edit Employee" : "Add Employee"}
          </DialogTitle>
          <DialogClose onClick={onClose} className=" text-blue hover:bg-background group">
          <X className="h-4 w-4 sm:h-5 sm:w-5 text-background group-hover:text-foreground" />

          </DialogClose>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
          </div>
        ) : (
          <motion.div
            variants={ANIMATION_VARIANTS.container}
            initial="hidden"
            animate="visible"
            className="h-full md:h-[75vh] overflow-y-auto"
          >
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-6 bg-background/5 p-1 mx-2 mt-2 rounded-lg overflow-x-auto">
                  <TabsTrigger value="profile" className="data-[state=active]:bg-foreground data-[state=active]:text-background text-background  text-xs md:text-sm">
                    <ImageIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="personal" className="data-[state=active]:bg-foreground data-[state=active]:text-background text-background  text-xs md:text-sm">
                    <User className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="job" className="data-[state=active]:bg-foreground data-[state=active]:text-background text-background  text-xs md:text-sm">
                    <Briefcase className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Job
                  </TabsTrigger>
                  <TabsTrigger value="payment" className="data-[state=active]:bg-foreground data-[state=active]:text-background text-background  text-xs md:text-sm">
                    <CreditCard className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Payment
                  </TabsTrigger>
                  <TabsTrigger value="allowances" className="data-[state=active]:bg-foreground data-[state=active]:text-background text-background  text-xs md:text-sm">
                    <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Benefits 
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="data-[state=active]:bg-foreground data-[state=active]:text-background text-background  text-xs md:text-sm">
                    <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Documents
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="p-2 md:p-4">
                  <Card className="border border-background/10 shadow-sm bg-foreground">
                    <CardContent className="p-3 md:p-6">
                      <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-4 md:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4">Employee Identification</h3>
                            <div className="space-y-3 md:space-y-4">
                              <div>
                                <label className="block pb-1 text-xs md:text-sm text-background/70">Employee ID</label>
                                <Input
                                  name="employeeId"
                                  value={employeeData.employeeId}
                                  onChange={handleChange}
                                  placeholder="Employee ID"
                                  readOnly
                                  className="bg-background/5 border-background/10"
                                />
                              </div>
                              <div>
                                <label className="block pb-1 text-xs md:text-sm text-background/70">Client ID</label>
                                <Input
                                  name="clientId"
                                  value={employeeData.clientId}
                                  onChange={handleChange}
                                  placeholder="Client ID"
                                  readOnly
                                  className="bg-background/5 border-background/10"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center justify-center mt-4 md:mt-0">
                            <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4">Profile Image</h3>
                            <div className="border border-background/10 p-3 md:p-4 rounded-lg shadow-sm bg-background/5 w-full max-w-xs md:w-48">
                              <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-3 md:mb-4">
                                {profileImage || employeeData.profileImage ? (
                                  <Image
                                    src={
                                      profileImage
                                        ? URL.createObjectURL(profileImage)
                                        : employeeData.profileImage
                                    }
                                    width={50}
                                    height={50}
                                    alt="Profile Preview"
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full rounded-full bg-background/10 text-background/40">
                                    <span className="text-xs md:text-sm">No Image</span>
                                  </div>
                                )}
                              </div>
                              <label className="block text-center border-2 bg-foreground text-background py-2 px-3 md:px-4 rounded cursor-pointer hover:bg-background hover:border-2 hover:text-foreground transition duration-150 text-xs md:text-sm">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(e, "profileImage")}
                                  className="hidden"
                                />
                                {employeeData.profileImage ? "Change Image" : "Upload Image"}
                              </label>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Personal Details Tab */}
                <TabsContent value="personal" className="p-2 md:p-4">
                  <Card className="border border-background/10 shadow-sm bg-foreground">
                    <CardContent className="p-3 md:p-6">
                      <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-4 md:space-y-6">
                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">First Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-3 h-3 md:w-4 md:h-4" />
                              <Input
                                name="firstName"
                                value={employeeData.firstName}
                                onChange={handleChange}
                                placeholder="First Name"
                                className="pl-8 md:pl-10 bg-background/5 border-background/10 text-xs md:text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Middle Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-3 h-3 md:w-4 md:h-4" />
                              <Input
                                name="middleName"
                                value={employeeData.middleName}
                                onChange={handleChange}
                                placeholder="Middle Name"
                                className="pl-8 md:pl-10 bg-background/5 border-background/10 text-xs md:text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Surname</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-3 h-3 md:w-4 md:h-4" />
                              <Input
                                name="surname"
                                value={employeeData.surname}
                                onChange={handleChange}
                                placeholder="Surname"
                                className="pl-8 md:pl-10 bg-background/5 border-background/10 text-xs md:text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Date of Birth</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-3 h-3 md:w-4 md:h-4" />
                              <Input
                                type="date"
                                name="dob"
                                value={new Date(employeeData.dob).toISOString().split('T')[0]}                                onChange={handleChange}
                                // value={employeeData.dob}
                                placeholder="Date of Birth"
                                className="pl-8 md:pl-10 bg-background/5 border-background/10 text-xs md:text-sm"
                              />
                              {/* {employeeData.dob} */}
                            </div>
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Gender</label>
                            <Select
                              value={employeeData.gender}
                              onValueChange={(value) =>
                                setEmployeeData((prev) => ({ ...prev, gender: value }))
                              }
                            >
                              <SelectTrigger className="bg-background/5 border-background/10 text-xs md:text-sm">
                                <SelectValue placeholder="Gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MALE">Male</SelectItem>
                                <SelectItem value="FEMALE">Female</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Village</label>
                            <Input
                              name="village"
                              value={employeeData.village}
                              onChange={handleChange}
                              placeholder="Village"
                              className="bg-background/5 border-background/10 text-xs md:text-sm"
                            />
                          </div>
                        </div>

                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 mt-4 md:mt-6">Contact Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Phone Number</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-3 h-3 md:w-4 md:h-4" />
                              <Input
                                name="phoneNumber"
                                value={employeeData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Phone Number"
                                className="pl-8 md:pl-10 bg-background/5 border-background/10 text-xs md:text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Email Address</label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-3 h-3 md:w-4 md:h-4" />
                              <Input
                                name="emailAddress"
                                value={employeeData.emailAddress}
                                onChange={handleChange}
                                placeholder="Email Address"
                                className="pl-8 md:pl-10 bg-background/5 border-background/10 text-xs md:text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Job Details Tab */}
                <TabsContent value="job" className="p-2 md:p-4">
                  <Card className="border border-background/10 shadow-sm bg-foreground">
                    <CardContent className="p-3 md:p-6">
                      <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-4 md:space-y-6">
                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4">Job Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Hire Date</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-3 h-3 md:w-4 md:h-4" />
                              <Input
                                name="hireDate"
                                type="date"
                                value={new Date(employeeData.hireDate).toISOString().split('T')[0]}                                
                                onChange={handleChange}
                                className="pl-8 md:pl-10 bg-background/5 border-background/10 text-xs md:text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Job Title</label>

                            <Select
                              value={employeeData.jobTitle}
                              onValueChange={(value) =>
                                setEmployeeData((prev) => ({
                                  ...prev,
                                  jobTitle: value,
                                }))
                              }
                            >
                              <SelectTrigger className="bg-background/5 border-background/10 text-xs md:text-sm">

                                <SelectValue
                                  placeholder={
                                    jobTitle.find((jt) => jt._id === employeeData.jobTitle)
                                      ?.job_title || "Job Title"
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
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Department</label>
                            <Select
                              value={employeeData.department}
                              onValueChange={(value) =>
                                setEmployeeData((prev) => ({
                                  ...prev,
                                  department: value,
                                }))
                              }
                            >
                              <SelectTrigger className="bg-background/5 border-background/10 text-xs md:text-sm">
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
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Work Location</label>
                            <Select
                              value={employeeData.workLocation}
                              onValueChange={(value) =>
                                setEmployeeData((prev) => ({
                                  ...prev,
                                  workLocation: value,
                                }))
                              }
                            >
                              <SelectTrigger className="bg-background/5 border-background/10 text-xs md:text-sm">
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
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Manager</label>
                            <Select
                              value={employeeData.manager}
                              onValueChange={(value) =>
                                setEmployeeData((prev) => ({
                                  ...prev,
                                  manager: value,
                                }))
                              }
                            >
                              <SelectTrigger className="bg-background/5 border-background/10 text-xs md:text-sm">
                                <SelectValue
                                  placeholder={
                                    manager.find((man) => man._id === employeeData.manager)
                                      ?.manager || "Manager"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {manager.map((single) => (
                                  <SelectItem key={single._id} value={single._id}>
                                    {single.manager}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Cost Center</label>
                            <Select
                              value={employeeData.costCenter}
                              onValueChange={(value) =>
                                setEmployeeData((prev) => ({
                                  ...prev,
                                  costCenter: value,
                                }))
                              }
                            >
                              <SelectTrigger className="bg-background/5 border-background/10 text-xs md:text-sm">
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
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Employee Type</label>
                            <Select
                              value={employeeData.employeeType}
                              onValueChange={(value) =>
                                setEmployeeData((prev) => ({
                                  ...prev,
                                  employeeType: value,
                                }))
                              }
                            >
                              <SelectTrigger className="bg-background/5 border-background/10 text-xs md:text-sm">
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
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Payment Details Tab */}
                <TabsContent value="payment" className="p-2 md:p-4">
                  <Card className="border border-background/10 shadow-sm bg-foreground">
                    <CardContent className="p-3 md:p-6">
                      <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-4 md:space-y-6">
                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4">Pay Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Pay Type</label>
                            <Select
                              value={employeeData.payType}
                              onValueChange={(value) =>
                                setEmployeeData((prev) => ({ ...prev, payType: value }))
                              }
                            >
                              <SelectTrigger className="bg-background/5 border-background/10 text-xs md:text-sm">
                                <SelectValue placeholder="Pay Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="HOUR">Per Hour</SelectItem>
                                <SelectItem value="SALARY">Salary</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">
                              {employeeData.payType === "SALARY" ? "Salary" : "Rate Per Hour"}
                            </label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-3 h-3 md:w-4 md:h-4" />
                              <Input
                                name="ratePerHour"
                                value={employeeData.ratePerHour}
                                onChange={handleChange}
                                placeholder={
                                  employeeData.payType === "SALARY"
                                    ? "Salary"
                                    : "Rate Per Hour"
                                }
                                className="pl-8 md:pl-10 bg-background/5 border-background/10 text-xs md:text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Pay Frequency</label>
                            <Select
                              value={employeeData.payFrequency}
                              onValueChange={(value) =>
                                setEmployeeData((prev) => ({
                                  ...prev,
                                  payFrequency: value,
                                }))
                              }
                            >
                              <SelectTrigger className="bg-background/5 border-background/10 text-xs md:text-sm">
                                <SelectValue placeholder="Pay Frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel className="ml-2">Pay Frequency</SelectLabel>
                                  <SelectItem value="Weekly">Weekly</SelectItem>
                                  <SelectItem value="Fortnightly">Fortnightly</SelectItem>
                                  <SelectItem value="Monthly">Monthly</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 mt-4 md:mt-6">Payment Method</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-background/70">Payment Method</label>
                            <Select
                              value={employeeData.paymentMethod}
                              onValueChange={(value) =>
                                setEmployeeData((prev) => ({
                                  ...prev,
                                  paymentMethod: value,
                                }))
                              }
                            >
                              <SelectTrigger className="bg-background/5 border-background/10 text-xs md:text-sm">
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
                          </div>

                          {employeeData.paymentMethod !== "CASH" && (
                            <>
                              <div>
                                <label className="block pb-1 text-xs md:text-sm text-background/70">Bank Name</label>
                                <Input
                                  name="bankName"
                                  value={employeeData.bankName}
                                  onChange={handleChange}
                                  placeholder="Bank Name"
                                  className="bg-background/5 border-background/10 text-xs md:text-sm"
                                />
                              </div>

                              <div>
                                <label className="block pb-1 text-xs md:text-sm text-background/70">Account Name</label>
                                <Input
                                  name="accountName"
                                  value={employeeData.accountName}
                                  onChange={handleChange}
                                  placeholder="Account Name"
                                  className="bg-background/5 border-background/10 text-xs md:text-sm"
                                />
                              </div>

                              <div className="col-span-full">
                                <label className="block pb-1 text-xs md:text-sm text-background/70">Account Number</label>
                                <Input
                                  name="accountNumber"
                                  value={employeeData.accountNumber}
                                  onChange={handleChange}
                                  placeholder="Account Number"
                                  className="bg-background/5 border-background/10 text-xs md:text-sm"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>

               {/* Allowances & Deductions Tab */}
               <TabsContent value="allowances" className="p-2 md:p-4">
                  <Card className="border border-background/10 shadow-sm bg-foreground">
                    <CardContent className="p-3 md:p-6">
                      <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-4 md:space-y-6">
                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 text-background">Allowances & Deductions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                          <div className="bg-background/5 p-3 md:p-4 rounded-lg">
                            <h4 className="text-sm md:text-md font-bold mb-2 md:mb-4 text-center text-background">Allowances</h4>
                            <div className="space-y-1 md:space-y-2">
                              {allownce.map((single) => (
                                <div key={single._id} className="flex items-center p-1 md:p-2 rounded text-background hover:bg-background/10">
                                  <Checkbox
                                    checked={selectedAllownces.includes(single._id)}
                                    onCheckedChange={() =>
                                      handleSelectChange(single._id, "allownce")
                                    }
                                    className="bg-background mr-2 md:mr-3"
                                  />
                                  <span className="text-xs md:text-sm">{single.allownce}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-background/5 p-3 md:p-4 rounded-lg">
                            <h4 className="text-sm md:text-md font-bold mb-2 md:mb-4 text-center text-background">Deductions</h4>
                            <div className="space-y-1 md:space-y-2">
                              {deduction.map((single) => (
                                <div key={single._id} className="flex items-center p-1 md:p-2 rounded text-background hover:bg-background/10">
                                  <Checkbox
                                    checked={selectedDeductions.includes(single._id)}
                                    onCheckedChange={() =>
                                      handleSelectChange(single._id, "deduction")
                                    }
                                    className="bg-background mr-2 md:mr-3"
                                  />
                                  <span className="text-xs md:text-sm">{single.deduction}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 mt-4 md:mt-6 text-background">Leave Entitlements</h3>
                        <div className="bg-background/5 p-3 md:p-4 rounded-lg">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                            {leave.map((single) => (
                              <div key={single._id} className="flex items-center space-x-2 md:space-x-3 p-1 md:p-2 rounded text-background hover:bg-background/10">
                                <Checkbox
                                  checked={employeeData.leaves.some(
                                    (leave) => leave.leaveId === single._id
                                  )}
                                  onCheckedChange={() =>
                                    handleLeaveCheckboxChange(single._id)
                                  }
                                  className="bg-background mr-2 md:mr-3"
                                />
                                <span className="w-24 md:w-32 text-xs md:text-sm">{single.leave}</span>
                                {employeeData.leaves.some(
                                  (leave) => leave.leaveId === single._id
                                ) && (
                                  <Input
                                    className="w-16 md:w-20 text-xs md:text-sm"
                                    type="number"
                                    min="0"
                                    value={
                                      employeeData.leaves.find(
                                        (leave) => leave.leaveId === single._id
                                      ).available<=0 ? single.balance : employeeData.leaves.find(
                                        (leave) => leave.leaveId === single._id
                                      ).available
                                    }
                                    onChange={(e) =>
                                      handleSelectLeaveChange(single._id, e.target.value, single.balance)
                                    }
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="p-2 md:p-4">
                  <Card className="border border-background/10 shadow-sm bg-foreground">
                    <CardContent className="p-3 md:p-6">
                      <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-4 md:space-y-6">
                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4">Upload Documents</h3>
                        <div className="grid gap-3 md:gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                            <div>
                              <label className="block pb-1 text-xs md:text-sm text-background/60">Document Type</label>
                              <Input
                                name="documentType"
                                value={employeeData.documentType}
                                onChange={handleChange}
                                placeholder="Document Type"
                                className="bg-background/5 border-background/10 text-xs md:text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block pb-1 text-xs md:text-sm text-background/60">Document Description</label>
                              <Input
                                name="documentDescription"
                                value={employeeData.documentDescription}
                                onChange={handleDescriptionChange}
                                placeholder="Document Description"
                                className="bg-background/5 border-background/10 text-xs md:text-sm"
                              />
                            </div>
                            
                            <div className="flex items-end">
                              <div className="relative w-full">
                                <input
                                  type="file"
                                  id="documentFile"
                                  onChange={(e) => handleFileChange(e, "document")}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="documentFile"
                                  className="block w-full bg-foreground text-background py-2 px-3 md:px-4 rounded cursor-pointer hover:bg-background hover:text-foreground hover:border-2 transition duration-150 text-center text-xs md:text-sm"
                                >
                                  Choose File
                                </label>
                              </div>
                            </div>
                          </div>
                          
              
                          
                          {employeeData.documents.length > 0 && (
                            <div className="mt-4 md:mt-6">
                              <h4 className="text-sm md:text-md font-bold mb-1 md:mb-2">Uploaded Documents</h4>
                              <div className="bg-background/5 rounded-lg p-2">
                                <table className="w-full">
                                  <thead className="border-b">
                                    <tr>
                                      <th className="text-left p-1 md:p-2 text-xs md:text-sm">Type</th>
                                      <th className="text-left p-1 md:p-2 text-xs md:text-sm">Description</th>
                                      <th className="text-left p-1 md:p-2 text-xs md:text-sm">File</th>
                                      <th className="text-right p-1 md:p-2 text-xs md:text-sm">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {employeeData.documents.map((doc, index) => (
                                      <tr key={index} className="border-b border-background/10 hover:bg-background/10">
                                        <td className="p-1 md:p-2 text-xs md:text-sm">{doc.type}</td>
                                        <td className="p-1 md:p-2 text-xs md:text-sm">{doc.description}</td>
                                        <td className="p-1 md:p-2 text-xs md:text-sm text-foreground/70">
                                          {doc.document ? doc.document.split('/').pop() : doc.file.name}
                                        </td>
                                        <td className="p-1 md:p-2 text-right">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => removeDocument(index)}
                                            className="h-6 md:h-8 px-1 md:px-2 text-destructive hover:bg-destructive/10 text-xs md:text-sm"
                                          >
                                            Remove
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter className="bg-background/5 p-3 md:p-4 flex flex-col sm:flex-row justify-between">
                <div className="mb-2 sm:mb-0">
                  {activeTab !== "profile" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const tabs = ["profile", "personal", "job", "payment", "allowances", "documents"];
                        const currentIndex = tabs.indexOf(activeTab);
                        setActiveTab(tabs[currentIndex - 1]);
                      }}
                      className="mr-2 bg-background border border-foreground text-foreground hover:bg-foreground hover:text-background transition-all text-xs md:text-sm"
                    >
                      Previous
                    </Button>
                  )}
                  {activeTab !== "documents" && (
                    <Button
                      type="button"
                      onClick={() => {
                        const tabs = ["profile", "personal", "job", "payment", "allowances", "documents"];
                        const currentIndex = tabs.indexOf(activeTab);
                        setActiveTab(tabs[currentIndex + 1]);
                      }}
                      className="bg-foreground text-background hover:bg-background hover:text-foreground hover:border-2 border-foreground transition-all text-xs md:text-sm"
                    >
                      Next
                    </Button>
                  )}
                </div>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="mr-2 bg-background border border-foreground text-foreground hover:bg-foreground hover:text-background transition-all text-xs md:text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-foreground text-background hover:bg-background hover:text-foreground hover:border-2 border-foreground transition-all text-xs md:text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-background mr-1 md:mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      "Save Employee"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};


const PopupForm = ({ onClose, setEmployees, employeeToEdit }) => {
  const { data: session } = useSession();
  const clientId = session.user.username;
  console.log(clientId);
  const [employeeData, setEmployeeData] = useState({
    firstName: "",
    middleName: "",
    surname: "",
    dob: new Date(),
    gender: "",
    phoneNumber: "",
    emailAddress: "",
    village: "",
    status: "ACTIVE",
    hireDate: new Date(),
    jobTitle: "",
    department: "",
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

  const handleSelectLeaveChange = (leaveID, value, balance) => {
    console.log(balance)
    console.log(value)
    setEmployeeData((prev) => ({
      ...prev,
      leaves: prev.leaves.map((leave) =>
        leave.leaveId === leaveID ? { ...leave, available: value<=0 ? balance : value } : leave
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

    isLoading ? (<LoadingSpinner/>) : (
    <EmployeeFormDialog
    employeeToEdit = {employeeToEdit}
    onClose = {onClose}
    handleSubmit = {handleSubmit}
    employeeData = {employeeData} 
    setEmployeeData = {setEmployeeData}
    handleChange = {handleChange}
    handleFileChange = {handleFileChange}
    profileImage = {profileImage}
    isLoading = {isLoading}
    isSubmitting = {isSubmitting}
    jobTitle = {jobTitle}
    department = {department}
    location = {location}
    manager = {manager}
    costCenter = {costCenter}
    employeeType = {employeeType}
    allownce ={allownce}
    deduction = {deduction}
    leave ={leave}
    selectedAllownces={selectedAllownces}
    selectedDeductions={selectedDeductions}
    uploadDocument={uploadDocument}
    handleDescriptionChange={handleDescriptionChange}
    removeDocument={removeDocument}
    handleSelectChange={handleSelectChange}
    handleLeaveCheckboxChange={handleLeaveCheckboxChange}
    handleSelectLeaveChange={handleSelectLeaveChange}
    />
    )
    // <Dialog open={true} onOpenChange={onClose}>
    //   <DialogContent className="max-w-3xl">
    //     <DialogHeader>
    //       <DialogTitle>
    //         {employeeToEdit ? "Edit Employee" : "Add Employee"}
    //       </DialogTitle>
    //       <DialogClose onClick={onClose} />
    //     </DialogHeader>

    //     {isLoading ? (
    //       <LoadingSpinner />
    //     ) : (
    //       <form
    //         onSubmit={handleSubmit}
    //         className="space-y-6 px-1 h-[75vh] overflow-y-auto"
    //       >
    //         {/* Image Upload */}

    //         <div className="max-w-sm mx-auto">
    //           <div className="border border-background-300 p-4 rounded-lg shadow-sm">
    //             <div className="relative w-32 h-32 mx-auto mb-4">
    //               {console.log(profileImage)}
    //               {profileImage || employeeData.profileImage ? (
    //                 <Image
    //                   src={
    //                     profileImage
    //                       ? URL.createObjectURL(profileImage)
    //                       : employeeData.profileImage
    //                   }
    //                   width={50}
    //                   height={50}
    //                   alt="Profile Preview"
    //                   className="w-full h-full rounded-full object-cover"
    //                 />
    //               ) : (
    //                 <div className="flex items-center justify-center w-full h-full rounded-full bg-gray-100 text-gray-500">
    //                   <span>No Image</span>{" "}
    //                 </div>
    //               )}
    //             </div>
    //             <label className="block text-center border-2 bg-foreground text-white py-2 px-4 rounded cursor-pointer hover:bg-background hover:border-2 hover:text-foreground transition duration-150">
    //               <input
    //                 type="file"
    //                 accept="image/*"
    //                 onChange={(e) => handleFileChange(e, "profileImage")}
    //                 className="hidden"
    //               />
    //               {employeeData.profileImage ? "Change Image" : "Upload Image "}
    //             </label>
    //           </div>
    //         </div>

    //         {/* Document Upload */}
    //         <h3 className="text-md font-bold">Documents</h3>
    //         <section>
    //           <input
    //             type="file"
    //             accept=".pdf,.doc,.docx"
    //             multiple
    //             onChange={(e) => handleFileChange(e, "documents")}
    //           />
    //           <ul className="mt-2">
    //             {(uploadDocument.length > 0
    //               ? uploadDocument
    //               : employeeData.documents
    //             ).map((doc, index) => (
    //               <li key={index} className="flex justify-between items-center">
    //                 <div>
    //                   <span>{doc.name}</span>
    //                   <input
    //                     type="text"
    //                     placeholder="Enter description"
    //                     value={doc.description}
    //                     onChange={(e) =>
    //                       handleDescriptionChange(index, e.target.value)
    //                     }
    //                     className="ml-2 p-1 border rounded"
    //                   />
    //                 </div>
    //                 <button
    //                   type="button"
    //                   onClick={() => removeDocument(index)}
    //                   className="text-red-500 text-sm"
    //                 >
    //                   Remove
    //                 </button>
    //               </li>
    //             ))}
    //           </ul>
    //         </section>

    //         {/* Employee Details */}
    //         <h3 className="text-md font-bold">Employee Details</h3>
    //         <section className="grid grid-cols-2 gap-4">
    //           <div>
    //             <label className="block pb-1"> Employee ID</label>
    //             <Input
    //               name="employeeId"
    //               value={employeeData.employeeId}
    //               onChange={handleChange}
    //               placeholder="Employee ID"
    //               readOnly
    //             />
    //           </div>
    //           <div>
    //             <label className="block pb-1"> Client ID</label>
    //             <Input
    //               name="clientId"
    //               value={employeeData.clientId}
    //               onChange={handleChange}
    //               placeholder="Client ID"
    //               readOnly
    //             />
    //           </div>
    //         </section>

    //         {/* Personal Details */}
    //         <h3 className="text-md font-bold">Personal Details</h3>
    //         <section className="grid grid-cols-3 gap-4">
    //           <div>
    //             <label className="block pb-1">First Name</label>
    //             <Input
    //               name="firstName"
    //               value={employeeData.firstName}
    //               onChange={handleChange}
    //               placeholder="First Name"
    //             />
    //           </div>

    //           <div>
    //             <label className="block pb-1">Middle Name</label>
    //             <Input
    //               name="middleName"
    //               value={employeeData.middleName}
    //               onChange={handleChange}
    //               placeholder="Middle Name"
    //             />
    //           </div>

    //           <div>
    //             <label className="block pb-1">Surname</label>
    //             <Input
    //               name="surname"
    //               value={employeeData.surname}
    //               onChange={handleChange}
    //               placeholder="Surname"
    //             />
    //           </div>

    //           <div>
    //             <label className="block pb-1">Date of Birth</label>
    //             <Input
    //               type="date"
    //               name="dob"
    //               value={employeeData.dob}
    //               onChange={handleChange}
    //               placeholder="Date of Birth"
    //             />
    //           </div>

    //           <div>
    //             <label className="block pb-1">Gender</label>
    //             <Select
    //               value={employeeData.gender}
    //               onValueChange={(value) =>
    //                 setEmployeeData((prev) => ({ ...prev, gender: value }))
    //               }
    //             >
    //               <SelectTrigger>
    //                 <SelectValue placeholder="Gender" />
    //               </SelectTrigger>
    //               <SelectContent>
    //                 <SelectItem value="MALE">Male</SelectItem>
    //                 <SelectItem value="FEMALE">Female</SelectItem>
    //                 <SelectItem value="OTHER">Other</SelectItem>
    //               </SelectContent>
    //             </Select>
    //           </div>

    //           <div>
    //             <label className="block pb-1">Village</label>
    //             <Input
    //               name="village"
    //               value={employeeData.village}
    //               onChange={handleChange}
    //               placeholder="Village"
    //             />
    //           </div>
    //         </section>

    //         {/* Contact Details */}
    //         <h3 className="text-md font-bold">Contact Details</h3>

    //         <section className="grid grid-cols-2 gap-4">
    //           <div>
    //             <label className="block pb-1">Phone Number</label>
    //             <Input
    //               name="phoneNumber"
    //               value={employeeData.phoneNumber}
    //               onChange={handleChange}
    //               placeholder="Phone Number"
    //             />
    //           </div>

    //           <div>
    //             <label className="block pb-1">Email Address</label>
    //             <Input
    //               name="emailAddress"
    //               value={employeeData.emailAddress}
    //               onChange={handleChange}
    //               placeholder="Email Address"
    //             />
    //           </div>
    //         </section>

    //         {/* Job Details */}
    //         <h3 className="text-md font-bold">Job Details</h3>

    //         <section className="grid grid-cols-3 gap-4">
    //           <div>
    //             <label className="block pb-1">Hire Date</label>
    //             <Input
    //               name="hireDate"
    //               type="date"
    //               value={employeeData.hireDate}
    //               onChange={handleChange}
    //               placeholder="Hire Date"
    //             />
    //           </div>

    //           <div>
    //             <label className="block pb-1">Job Title</label>
    //             <Select
    //               value={employeeData.jobTitle}
    //               onValueChange={(value) =>
    //                 setEmployeeData((prev) => ({
    //                   ...prev,
    //                   jobTitle: value,
    //                 }))
    //               }
    //             >
    //               <SelectTrigger>
    //                 <SelectValue
    //                   placeholder={
    //                     jobTitle.find((jt) => jt._id === employeeData.jobTitle)
    //                       ?.job_title || "Job Title"
    //                   }
    //                 />
    //               </SelectTrigger>
    //               <SelectContent>
    //                 {jobTitle.map((single) => (
    //                   <SelectItem key={single._id} value={single._id}>
    //                     {single.job_title}
    //                   </SelectItem>
    //                 ))}
    //               </SelectContent>
    //             </Select>
    //           </div>

    //           <div>
    //             <label className="block pb-1">Department</label>
    //             <Select
    //               value={employeeData.department}
    //               onValueChange={(value) =>
    //                 setEmployeeData((prev) => ({
    //                   ...prev,
    //                   department: value,
    //                 }))
    //               }
    //             >
    //               <SelectTrigger>
    //                 <SelectValue
    //                   placeholder={
    //                     department.find(
    //                       (dept) => dept._id === employeeData.department
    //                     )?.department || "Department"
    //                   }
    //                 />
    //               </SelectTrigger>
    //               <SelectContent>
    //                 {department.map((single) => (
    //                   <SelectItem key={single._id} value={single._id}>
    //                     {single.department}
    //                   </SelectItem>
    //                 ))}
    //               </SelectContent>
    //             </Select>
    //           </div>

    

    //           <div>
    //             <label className="block pb-1">Work Location</label>
    //             <Select
    //               value={employeeData.workLocation}
    //               onValueChange={(value) =>
    //                 setEmployeeData((prev) => ({
    //                   ...prev,
    //                   workLocation: value,
    //                 }))
    //               }
    //             >
    //               <SelectTrigger>
    //                 <SelectValue
    //                   placeholder={
    //                     location.find(
    //                       (wl) => wl._id === employeeData.workLocation
    //                     )?.work_location || "Work Location"
    //                   }
    //                 />
    //               </SelectTrigger>
    //               <SelectContent>
    //                 {location.map((single) => (
    //                   <SelectItem key={single._id} value={single._id}>
    //                     {single.work_location}
    //                   </SelectItem>
    //                 ))}
    //               </SelectContent>
    //             </Select>
    //           </div>

    //           <div>
    //             <label className="block pb-1">Manager</label>
    //             <Select
    //               value={employeeData.manager}
    //               onValueChange={(value) =>
    //                 setEmployeeData((prev) => ({
    //                   ...prev,
    //                   manager: value,
    //                 }))
    //               }
    //             >
    //               <SelectTrigger>
    //                 <SelectValue
    //                   placeholder={
    //                     manager.find((man) => man._id === employeeData.manager)
    //                       ?.manager || "Manager"
    //                   }
    //                 />
    //               </SelectTrigger>
    //               <SelectContent>
    //                 {manager.map((single) => (
    //                   <SelectItem key={single._id} value={single._id}>
    //                     {single.manager}
    //                   </SelectItem>
    //                 ))}
    //               </SelectContent>
    //             </Select>
    //           </div>

    //           <div>
    //             <label className="block pb-1">Cost Center</label>
    //             <Select
    //               value={employeeData.costCenter}
    //               onValueChange={(value) =>
    //                 setEmployeeData((prev) => ({
    //                   ...prev,
    //                   costCenter: value,
    //                 }))
    //               }
    //             >
    //               <SelectTrigger>
    //                 <SelectValue
    //                   placeholder={
    //                     costCenter.find(
    //                       (cc) => cc._id === employeeData.costCenter
    //                     )?.cost_center || "Cost Center"
    //                   }
    //                 />
    //               </SelectTrigger>
    //               <SelectContent>
    //                 {costCenter.map((single) => (
    //                   <SelectItem key={single._id} value={single._id}>
    //                     {single.cost_center}
    //                   </SelectItem>
    //                 ))}
    //               </SelectContent>
    //             </Select>
    //           </div>

    //           {/* Employee Type */}
    //           <div>
    //             <label className="block pb-1">Employee Type</label>

    //             <Select
    //               value={employeeData.employeeType}
    //               onValueChange={(value) =>
    //                 setEmployeeData((prev) => ({
    //                   ...prev,
    //                   employeeType: value,
    //                 }))
    //               }
    //             >
    //               <SelectTrigger>
    //                 <SelectValue
    //                   placeholder={
    //                     employeeType.find(
    //                       (et) => et._id === employeeData.employeeType
    //                     )?.employee_type || "Employee Type"
    //                   }
    //                 />
    //               </SelectTrigger>
    //               <SelectContent>
    //                 {employeeType.map((single) => (
    //                   <SelectItem key={single._id} value={single._id}>
    //                     {single.employee_type}
    //                   </SelectItem>
    //                 ))}
    //               </SelectContent>
    //             </Select>
    //           </div>

    //           <div>
    //               <label className="block pb-1">Pay Type</label>
    //               <Select
    //                 value={employeeData.payType}
    //                 onValueChange={(value) =>
    //                   setEmployeeData((prev) => ({ ...prev, payType: value }))
    //                 }
    //               >
    //                 <SelectTrigger>
    //                   <SelectValue placeholder="Pay Type" />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                   <SelectItem value="HOUR">Per Hour</SelectItem>
    //                   <SelectItem value="SALARY">Salary</SelectItem>
    //                 </SelectContent>
    //               </Select>
    //             </div>

    //             <div>
    //               {employeeData.payType === "SALARY" ? (
    //                 <label className="block pb-1">Salary </label>
    //               ) : (
    //                 <label className="block pb-1">Rate Per Hour</label>
    //               )}

    //               <Input
    //                 name="ratePerHour"
    //                 value={employeeData.ratePerHour}
    //                 onChange={handleChange}
    //                 placeholder={
    //                   employeeData.payType === "SALARY"
    //                     ? "Salary"
    //                     : "Rate Per Hour"
    //                 }
    //               />
    //             </div>

    //             <div>
    //               <label className="block pb-1">Pay Frequency</label>
    //               <Select
    //                 value={employeeData.payFrequency}
    //                 onValueChange={(value) =>
    //                   setEmployeeData((prev) => ({
    //                     ...prev,
    //                     payFrequency: value,
    //                   }))
    //                 }
    //               >
    //                 <SelectTrigger>
    //                   <SelectValue placeholder="Pay Frequency" />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                 <SelectGroup>
    //                 <SelectLabel className="ml-2">Pay Frequency</SelectLabel>
    //                 <SelectItem value="Weekly">Weekly</SelectItem>
    //                   <SelectItem value="Fortnightly">Fortnightly</SelectItem>
    //                   <SelectItem value="Monthly">Monthly</SelectItem>
    //                   </SelectGroup>
    //                 </SelectContent>
    //               </Select>
    //             </div>
    //         </section>

    //         {/* Payment Details */}
    //         <h3 className="text-MD font-bold">Payment Details</h3>
    //         <section>
    //           <div className="grid grid-cols-3 gap-4">
    //             <div>
    //               <label className="block pb-1">Payment Method</label>
    //               <Select
    //                 value={employeeData.paymentMethod}
    //                 onValueChange={(value) =>
    //                   setEmployeeData((prev) => ({
    //                     ...prev,
    //                     paymentMethod: value,
    //                   }))
    //                 }
    //               >
    //                 <SelectTrigger>
    //                   <SelectValue placeholder="Payment Method" />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                   <SelectItem value="CASH">Cash</SelectItem>
    //                   <SelectItem value="CHEQUE">Cheque</SelectItem>
    //                   <SelectItem value="DIRECT DEPOSIT">
    //                     Direct Deposit
    //                   </SelectItem>
    //                 </SelectContent>
    //               </Select>
    //             </div>

    //             {employeeData.paymentMethod === "CASH" ? (
    //               ""
    //             ) : (
    //               <>
    //                 <div>
    //                   <label className="block pb-1">Bank Name</label>
    //                   <Input
    //                     name="bankName"
    //                     value={employeeData.bankName}
    //                     onChange={handleChange}
    //                     placeholder="Bank Name"
    //                   />
    //                 </div>

    //                 <div>
    //                   <label className="block pb-1">Account Name</label>
    //                   <Input
    //                     name="accountName"
    //                     value={employeeData.accountName}
    //                     onChange={handleChange}
    //                     placeholder="Account Name"
    //                   />
    //                 </div>

    //                 <div>
    //                   <label className="block pb-1">Account Number</label>
    //                   <Input
    //                     name="accountNumber"
    //                     value={employeeData.accountNumber}
    //                     onChange={handleChange}
    //                     placeholder="Account Number"
    //                   />
    //                 </div>
    //               </>
    //             )}
    //           </div>
    //         </section>

    //         {/* Pay Details */}
    //         {/* <h3 className="text-MD font-bold">Pay Details</h3>

    //         <section>
    //           <div className="grid grid-cols-3 gap-4">
               
    //           </div>
    //         </section> */}

    //         {/* Allownce and Deduction */}
    //         <h3 className="text-sm font-bold text-center bg-foreground text-white p-2">
    //           Allownces and Deduction Details{" "}
    //         </h3>

    //         <section className="flex justify-around ">
    //           <div>
    //             <h3 className="text-MD font-bold">Allownces </h3>

    //             {allownce.map((single) => (
    //               <div key={single._id}>
    //                 <label className="flex items-center space-x-3">
    //                   <Checkbox
    //                     checked={selectedAllownces.includes(single._id)}
    //                     onCheckedChange={() =>
    //                       handleSelectChange(single._id, "allownce")
    //                     }
    //                   />
    //                   <span>{single.allownce}</span>
    //                 </label>
    //               </div>
    //             ))}
    //           </div>
    //           <div>
    //             <h3 className="text-MD font-bold">Deductions </h3>
    //             {deduction.map((single) => (
    //               <div key={single._id}>
    //                 <label className="flex items-center space-x-3">
    //                   <Checkbox
    //                     checked={selectedDeductions.includes(single._id)}
    //                     onCheckedChange={() =>
    //                       handleSelectChange(single._id, "deduction")
    //                     }
    //                   />
    //                   <span>{single.deduction}</span>
    //                 </label>
    //               </div>
    //             ))}
    //           </div>
    //         </section>

    //         {/*Leaves */}

    //         <section>
    //           <h3 className="text-sm font-bold text-center bg-foreground text-white p-2">
    //             Leaves Details{" "}
    //           </h3>
    //           <div className="mt-3">
    //             {leave.map((single) => (
    //               <div key={single._id}>
    //                 <label className="flex items-center space-x-3">
    //                   <Checkbox
    //                     checked={employeeData.leaves.some(
    //                       (leave) => leave.leaveId === single._id
    //                     )}
    //                     onCheckedChange={() =>
    //                       handleLeaveCheckboxChange(single._id)
    //                     }
    //                   />
    //                   <span>{single.leave}</span>
    //                   {employeeData.leaves.some(
    //                     (leave) => leave.leaveId === single._id
    //                   ) && (
    //                     <Input
    //                       className="w-[160px]"
    //                       type="number"
    //                       min="0"
    //                       value={
    //                         employeeData.leaves.find(
    //                           (leave) => leave.leaveId === single._id
    //                         ).available
    //                       }
    //                       onChange={(e) =>
    //                         handleSelectLeaveChange(single._id, e.target.value)
    //                       }
    //                       placeholder="Number of Leaves"
    //                     />
    //                   )}
    //                 </label>
    //               </div>
    //             ))}
    //           </div>
    //         </section>

    //         <DialogFooter>
    //           <Button
    //             type="button"
    //             variant="outline"
    //             onClick={onClose}
    //             disabled={isSubmitting}
    //           >
    //             Cancel
    //           </Button>
    //           <Button type="submit" disabled={isSubmitting}>
    //             {isSubmitting
    //               ? "Saving..."
    //               : employeeToEdit
    //               ? "Update Employee"
    //               : "Add Employee"}
    //           </Button>
    //         </DialogFooter>
    //       </form>
    //     )}
    //   </DialogContent>
    // </Dialog>
  );
};

export default PopupForm;
