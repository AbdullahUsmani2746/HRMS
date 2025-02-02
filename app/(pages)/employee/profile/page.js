"use client"
import {useState, useEffect} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import { 
  User, Briefcase, MapPin, Calendar, Phone, Mail,
  CreditCard, Building2, FileText, Clock, DollarSign
} from 'lucide-react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Header from '@/components/breadcumb';
import LoadingSpinner from '@/components/spinner';

const EmployeeProfile = () => {
  const {data: session} = useSession();
  const employeeId = session?.user?.username;
  const [employee, setemployee] = useState([]);
  const [IsLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const nameResponse = await axios.get(`/api/employees/${employeeId}`);
        setemployee(nameResponse.data.EmployeeData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [employeeId]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Header heading="Employee Profile"/>

    {IsLoading ? <LoadingSpinner
     variant="pulse"
     size="large"
     text="Processing..."
     fullscreen={true}
    />  :
     (
      <div className="max-w-7xl mx-auto p-6 space-y-6 animate-fadeIn">
        {/* Enhanced Header Section with Hover Effects */}
        <div className="flex items-start gap-6 mb-8 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="relative group">
            <Avatar className="w-32 h-32 ring-2 ring-offset-2 ring-foreground transition-all duration-300 group-hover:ring-4">
              {employee.profileImage ? (
                <Image 
                  src={employee.profileImage} 
                  alt={`${employee.firstName} ${employee.surname}`}
                  className="rounded-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                  width={128}
                  height={128}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-foreground to-foreground flex items-center justify-center text-3xl text-foreground transition-colors duration-300 hover:from-foreground hover:to-foreground">
                  {employee.firstName?.[0]}{employee.surname?.[0]}
                </div>
              )}
            </Avatar>
            <Badge 
              className={`absolute -top-2 -right-2 ${
                employee.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
              } animate-pulse`}
            >
              {employee.status}
            </Badge>
          </div>
          
          <div className="flex-1 transform transition-all duration-300 hover:translate-x-2">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground">
              {employee.firstName} {employee.middleName} {employee.surname}
            </h1>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-foregroundtransition-colors duration-200">
                <Briefcase className="w-4 h-4 text-foreground" />
                {employee.jobTitle}
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-foregroundtransition-colors duration-200">
                <Building2 className="w-4 h-4 text-foreground" />
                {employee.department}
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-foregroundtransition-colors duration-200">
                <MapPin className="w-4 h-4 text-foreground" />
                {employee.workLocation}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs with Animation */}
        <Tabs 
          defaultValue="personal" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-4 mb-8 p-1 bg-foreground rounded-xl">
            {['personal', 'employment', 'payroll', 'documents'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className={`capitalize transition-all  text-white duration-300 ${
                  activeTab === tab ? 'bg-white shadow-md' : 'hover:bg-foreground'
                }`}
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {['personal', 'employment', 'payroll', 'documents'].map((tab) => (
            <TabsContent 
              key={tab}
              value={tab} 
              className={`space-y-6 transform transition-all duration-500 ${
                activeTab === tab ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-foregroundto-white">
                  <CardTitle className="text-xl text-foreground">{tab.charAt(0).toUpperCase() + tab.slice(1)} Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                  {tab === 'documents' ? (
                    <div className="col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {employee.documents?.map((doc, index) => (
                          <div 
                            key={index}
                            className="p-4 border rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <FileText className="w-5 h-5 text-foreground" />
                              <h3 className="font-medium">{doc.name}</h3>
                            </div>
                            <p className="text-sm text-gray-500">{doc.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Dynamic content based on tab
                    Object.entries(
                      tab === 'personal' ? {
                        'Date of Birth': formatDate(employee.dob),
                        'Gender': employee.gender,
                        'Phone': employee.phoneNumber,
                        'Email': employee.emailAddress
                      } : tab === 'employment' ? {
                        'Hire Date': formatDate(employee.hireDate),
                        'Employee Type': employee.employeeType,
                        'Pay Schedule': employee.paySchedule,
                        'Cost Center': employee.costCenter
                      } : {
                        'Pay Type': employee.payType,
                        'Payment Method': employee.paymentMethod,
                        'Bank Name': employee.bankName,
                        'Account Name': employee.accountName
                      }
                    ).map(([key, value], index) => (
                      <div 
                        key={key}
                        className="flex items-center gap-3 p-4 rounded-lg hover:bg-foregroundtransition-all duration-300"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: 'fadeInUp 0.5s ease forwards'
                        }}
                      >
                        {getIcon(key, "w-5 h-5 text-foreground")}
                        <div>
                          <p className="text-sm text-gray-500">{key}</p>
                          <p className="font-medium">{value}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    )}
    </>
  );
};

// Helper function to get icons
const getIcon = (key, className) => {
  const icons = {
    'Date of Birth': Calendar,
    'Gender': User,
    'Phone': Phone,
    'Email': Mail,
    'Hire Date': Calendar,
    'Employee Type': Briefcase,
    'Pay Schedule': Clock,
    'Cost Center': Building2,
    'Pay Type': DollarSign,
    'Payment Method': CreditCard,
    'Bank Name': Building2,
    'Account Name': User
  };
  const IconComponent = icons[key] || User;
  return <IconComponent className={className} />;
};

export default EmployeeProfile;