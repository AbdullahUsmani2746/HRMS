import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { FileUp, DownloadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import LoadingSpinner from "@/components/spinner";
import { motion } from "framer-motion";

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

const BulkEmployeeUpload = ({ onClose, setEmployees }) => {
  const { data: session } = useSession();
  const clientId = session?.user?.username;
  const [isLoading, setIsLoading] = useState(false);
  const [mappingData, setMappingData] = useState({});
  const [errors, setErrors] = useState([]);
  const [processing, setProcessing] = useState(false);

  const fetchMappingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        depResponse,
        jobTitleResponse,
        locationResponse,
        employeeTypeResponse,
        leaveResponse,
        allownceResponse,
        deductionResponse,
        managerResponse,
        costCenterResponse,
      ] = await Promise.all([
        axios.get(`/api/employees/department?employerId=${clientId}`),
        axios.get(`/api/employees/jobTitle?employerId=${clientId}`),
        axios.get(`/api/employees/workLocation?employerId=${clientId}`),
        axios.get(`/api/employees/employeeType?employerId=${clientId}`),
        axios.get(`/api/employees/leave?employerId=${clientId}`),
        axios.get(`/api/employees/allownce?employerId=${clientId}`),
        axios.get(`/api/employees/deduction?employerId=${clientId}`),
        axios.get(`/api/employees/manager?employerId=${clientId}`),
        axios.get(`/api/employees/costCenter?employerId=${clientId}`),
      ]);

      setMappingData({
        departments: depResponse.data.data,
        jobTitles: jobTitleResponse.data.data,
        locations: locationResponse.data.data,
        employeeTypes: employeeTypeResponse.data.data,
        leaves: leaveResponse.data.data,
        allownces: allownceResponse.data.data,
        deductions: deductionResponse.data.data,
        managers: managerResponse.data.data,
        costCenters: costCenterResponse.data.data,
      });
    } catch (error) {
      toast.error("Failed to load reference data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  const getIDFromName = (type, name) => {
    const map = {
      department: mappingData.departments,
      jobTitle: mappingData.jobTitles,
      workLocation: mappingData.locations,
      employeeType: mappingData.employeeTypes,
      manager: mappingData.managers,
      costCenter: mappingData.costCenters,
      leave: mappingData.leaves,
      allownce: mappingData.allownces,
      deduction: mappingData.deductions,
    }[type];

    return map?.find(item => item.name === name || item[Object.keys(item)[1]] === name)?._id;
  };

  const processRow = (row) => {
    const errors = [];
    const processed = { ...row };
    
    const requiredFields = ['npfNumber', 'firstName', 'surname', 'dob', 'gender', 
      'phoneNumber', 'emailAddress', 'hireDate', 'jobTitle', 'department', 
      'workLocation', 'payType', 'ratePerHour', 'paymentMethod'];
    
    requiredFields.forEach(field => {
      if (!row[field]) errors.push(`Missing ${field}`);
    });

    processed.department = getIDFromName('department', row.department);
    processed.jobTitle = getIDFromName('jobTitle', row.jobTitle);
    processed.workLocation = getIDFromName('workLocation', row.workLocation);
    processed.employeeType = getIDFromName('employeeType', row.employeeType);
    processed.manager = getIDFromName('manager', row.manager);
    processed.costCenter = getIDFromName('costCenter', row.costCenter);
    
    [
      ['department', processed.department],
      ['jobTitle', processed.jobTitle],
      ['workLocation', processed.workLocation],
      ['employeeType', processed.employeeType],
    ].forEach(([field, id]) => {
      if (!id) errors.push(`Invalid ${field}: ${row[field]}`);
    });

    processed.allownces = row.allownces?.split(',').map(name => 
      getIDFromName('allownce', name.trim())).filter(Boolean);
    processed.deductions = row.deductions?.split(',').map(name => 
      getIDFromName('deduction', name.trim())).filter(Boolean);

    return { processed, errors };
  };

  const downloadTemplate = async () => {
    const template = [
      'firstName,middleName,surname,dob,gender,phoneNumber,emailAddress,village,',
      'hireDate,jobTitle,department,workLocation,manager,costCenter,employeeType,',
      'payType,ratePerHour,paymentMethod,bankName,accountName,accountNumber,allownces,deductions'
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      setProcessing(true);
      try {
        await fetchMappingData();
        
        Papa.parse(acceptedFiles[0], {
          complete: async (results) => {
            const employees = [];
            const allErrors = [];
            
            results.data.forEach((row, index) => {
              if (index === 0) return;
              const { processed, errors } = processRow(row);
              if (errors.length > 0) {
                allErrors.push({ row: index, errors });
              } else {
                employees.push({
                  ...processed,
                  clientId,
                  status: "ACTIVE",
                  documents: [],
                  leaves: []
                });
              }
            });

            if (allErrors.length > 0) {
              setErrors(allErrors);
              return;
            }

            const lastEmp = await axios.get(`/api/employees?clientId=${clientId}&sort=employeeId&limit=1`);
            const lastNumber = lastEmp.data.data[0]?.employeeId?.split('-')[1] || 0;
            
            employees.forEach((emp, index) => {
              emp.employeeId = `${clientId.split('-')[1]}-${String(Number(lastNumber) + index + 1).padStart(4, '0')}`;
            });

            const { data } = await axios.post('/api/employees/bulk', employees);
            setEmployees(prev => [...prev, ...data.data]);
            toast.success(`Successfully added ${employees.length} employees`);
            onClose();
          },
          header: true
        });
      } catch (error) {
        toast.error("Bulk upload failed");
        console.error(error);
      } finally {
        setProcessing(false);
      }
    },
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  return (
    <Dialog open={true}>
      <DialogContent className="bg-foreground max-w-full md:max-w-3xl p-0 h-[90vh] md:h-auto">
        <DialogHeader className="bg-foreground text-background p-3 md:p-4 rounded-t-lg flex flex-row justify-between">
          <DialogTitle className="text-xl md:text-2xl font-bold">
            Bulk Employee Upload
          </DialogTitle>
          <DialogClose onClick={onClose} className="text-blue hover:bg-background group">
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-background group-hover:text-foreground"/>
          </DialogClose>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <motion.div
            variants={ANIMATION_VARIANTS.container}
            initial="hidden"
            animate="visible"
            className="h-full md:h-[75vh] overflow-y-auto p-4"
          >
            <div className="space-y-6">
              <div className="text-center">
                <Button 
                  onClick={downloadTemplate} 
                  className="gap-2 bg-background text-foreground hover:bg-background/90"
                >
                  <DownloadCloud className="w-4 h-4" />
                  Download Template
                </Button>
              </div>

              <div 
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  ${isDragActive ? 'border-blue-500 bg-blue-50/20' : 'border-background/30'}`}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <FileUp className="w-12 h-12 mx-auto text-background/50" />
                  <p className="text-background/80">
                    {isDragActive ? 'Drop CSV file here' : 'Drag & drop CSV file, or click to select'}
                  </p>
                  <p className="text-sm text-background/60">CSV, XLS, XLSX formats supported</p>
                </div>
              </div>

              {processing && (
                <div className="mt-4 p-4 bg-background/10 rounded-lg text-center">
                  <p className="text-background/80">Processing file... Please wait</p>
                </div>
              )}

              {errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-500/10 rounded-lg">
                  <h3 className="text-red-500 font-bold mb-2">Errors found:</h3>
                  {errors.map((error, index) => (
                    <div key={index} className="text-red-400 text-sm">
                      Row {error.row}: {error.errors.join(', ')}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-sm text-background/80">
                <p className="font-bold text-background">Important notes:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>Use exact names from the system for department, job title, etc.</li>
                  <li>Required fields: NPF Number, First Name, Surname, Date of Birth, Gender, Phone, Email, Hire Date, Job Title, Department, Work Location, Pay Type, Rate/Salary, Payment Method</li>
                  <li>For allowances/deductions, use comma-separated names</li>
                  <li>Date formats: YYYY-MM-DD</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkEmployeeUpload;