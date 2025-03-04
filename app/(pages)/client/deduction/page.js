
"use client"
import DataManagementPage from "@/components/DataManagement";
import { useSession } from "next-auth/react";
// AllowancesPage.js

import DynamicFormComponent from "@/components/DynamicFormComponent";
import axios from "axios";

import { 
  User, 
  Mail, 
  Phone, 
  Home, 
  Briefcase, 
  Calculator, 
  DollarSign, 
  Percent, 
  Building, 
  CreditCard, 
  Globe, 
  Hash 
} from 'lucide-react';


const DynamicComponent = ({ existingData, onClose }) => {
  const fields = [
    // Personal Information
    {
      name: 'title',
      label: 'Title',
      placeholder: 'Enter title',
      icon: User,
      required: true
    },
    {
      name: 'email',
      label: 'Email',
      placeholder: 'Enter email address',
      type: 'email',
      icon: Mail,
      required: true
    },
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      placeholder: 'Enter phone number',
      icon: Phone,
      required: true
    },
    {
      name: 'address',
      label: 'Address',
      placeholder: 'Enter address',
      icon: Home,
      required: true
    },
    
    // Account Information
    {
      name: 'holdingAccount',
      label: 'Holding Account',
      placeholder: 'Enter holding account',
      type: 'select',
      options: ['Bank', 'Wages', 'Savings', 'Loans'],

      icon: Briefcase,
      required: true
    },
    
    // Calculation Details
    {
      name: 'calculation',
      label: 'Calculation',
      placeholder: 'Select calculation type',
      type: 'select',
      options: ['Amount Per Pay Period','Percentage', 'Time x Rate', 'Earning Rate'],

      icon: Calculator,
      required: true
    },
    
    // Calculation Options
    {
      name: 'payslipYTD',
      label: 'Payslip YTD',
      type: 'checkbox',
      defaultValue: false,
      required: false
    },
    {
      name: 'statutory',
      label: 'Statutory',
      type: 'checkbox',
      defaultValue: false,
      required: false
    },
    
    // Payee Details - Bank
    {
      name: 'payeeDetails.bank',
      label: 'Bank',
      placeholder: 'Select bank',
      type: 'select',
      options: ['ANZ', 'BSP', 'NBS', 'SCB', 'Others/Overseas'],
      icon: Building,
      required: true
    },
    {
      name: 'payeeDetails.accountName',
      label: 'Account Name',
      placeholder: 'Enter account name',
      icon: User,
      required: true
    },
    {
      name: 'payeeDetails.accountNumber',
      label: 'Account Number',
      placeholder: 'Enter account number',
      icon: CreditCard,
      required: true
    },
    {
      name: 'payeeDetails.country',
      label: 'Country',
      placeholder: 'Enter country',
      icon: Globe,
      required: true
    },
    {
      name: 'payeeDetails.employerNumberAtFund',
      label: 'Employer Number at Fund',
      placeholder: 'Enter employer number',
      icon: Hash,
      required: true
    }
  ];
  const handleSubmit = async (data, isEditing, editIndex) => {
    try {
      if (isEditing) {
        await axios.put(`/api/employees/deduction/${data[editIndex]._id}`, data[editIndex]);
      } else {
        await axios.post('/api/employees/deduction', { data });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <DynamicFormComponent
      title="Deduction"
      fields={fields}
      existingData={existingData}
      onSubmit={handleSubmit}
      onClose={onClose}
      allowMultiple={true}
    />
  );
};
const EmployeeTypePage = () => {

  const {data:session} = useSession();
  const employerId = session?.user?.username;
  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'email', header: 'Email' },
    { key: 'phoneNumber', header: 'Phone Number' },
    { key: 'holdingAccount', header: 'Holding Account' },
    { key: 'calculation', header: 'Calculation Type' },
    { key: 'amountPerPayPeriod', header: 'Payment Type' },
    { key: 'payeeDetails.bank', header: 'Bank' }
  ];

  return (
    <DataManagementPage
      pageTitle="Deductions"
      pageDescription="Manage and track employee deduction efficiently"
      addButtonText="Add Deduction"
      apiEndpoint={`/api/employees/deduction`}
      columns={columns}
      employerId={employerId}
      searchKeys={['title', 'email', 'payeeDetails.accountName']}
      FormComponent={DynamicComponent}
    />
  );
};

export default EmployeeTypePage;