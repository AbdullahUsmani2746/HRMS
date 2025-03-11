"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Contact,
  CircleDollarSign,
  AppWindowMac,
  LayoutDashboard,
  Users,
  PieChart,
  CircleHelp,
  Settings2,
  Locate,
  BriefcaseConveyorBelt,
  CalendarCheckIcon,
  Building,
  LucideUmbrella,
  DollarSignIcon,
  MinusCircleIcon,
  BriefcaseBusiness,
  UserCheck2Icon,
  Clipboard,
  Target,
  Send,
  CheckCircle
} from "lucide-react";
import SettingsModal from "./settingModal";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { NavEmployee } from "@/components/nav-employee";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import ivilasiLogo from "@/public/ivilasi-logo.png";
import EbizzLogo from "@/public/ebizz-logo.png";

const data = {
  user: {
    name: "Ebizz Solutions",
    email: "m@example.com",
    avatar: EbizzLogo,
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Subscription",
      url: "/admin/subscription",
      icon: CircleDollarSign,
      isActive: true,
    },
    {
      title: "Applications",
      url: "/admin/application",
      icon: AppWindowMac,
      isActive: true,
    },
    {
      title: "Clients",
      url: "/admin/employers",
      icon: Users,
      isActive: true,
    },
    {
      title: "Reports",
      url: "#",
      icon: PieChart,
      isActive: true,
    },
    {
      title: "Help Desk",
      url: "/admin/helpdesk",
      icon: CircleHelp,
      isActive: true,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      isActive: true,
    },
  ],
  navEmployee: [
    {
      title: "Overview",
      url: "/client/overview",
      icon: Target,
      isActive: true,
    },
    {
      title: "Dashboard",
      url: "/client/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Employee Management",
      url: "#",
      icon: Users,
      isActive: false,
      items:[
        {
          title: "Employee Onboarding",
          url: "/client/employee",
          icon: Locate,
          isActive: true,
        },
    
    {
      title: "Work Location",
      url: "/client/location",
      icon: Locate,
      isActive: true,
    },
    {
      title: "Department",
      url: "/client/department",
      icon: Building,
      isActive: true,
    },
    {
      title: "Cost Center",
      url: "/client/costCenter",
      icon: PieChart,
      isActive: true,
    },
    {
      title: "Employee Type",
      url: "/client/employeeType",
      icon: UserCheck2Icon,
      isActive: true,
    },
  ]
    },
  {
    title: "HR Operations",
    url: "#",
    icon: Users,
    isActive: false,
    items:[

   
    {
      title: "Manager",
      url: "/client/manager",
      icon: BriefcaseConveyorBelt,
      isActive: true,
    },
    {
      title: "Job Title",
      url: "/client/jobTitle",
      icon: BriefcaseBusiness,
      isActive: true,
    },
    { 
      title: "Allowances",
      url: "/client/allowance",
      icon: DollarSignIcon,
      isActive: true,
    },
    {
      title: "Deductions",
      url: "/client/deduction",
      icon: MinusCircleIcon,
      isActive: true,
    },
    
    {
      title: "Leaves",
      url: "/client/leave",
      icon: LucideUmbrella,
      isActive: true,
    },
  ]
},

{
  title: "Time Entry Management",
  url: "/client/attendance",
  icon: Clipboard,
  isActive: true,
},
    

    {
      title: "Payroll & Benefits",
      url: "#",
      icon: LucideUmbrella,
      isActive: true,
      items: [
        {
          title: "Payroll Cycle",
          url: "/client/payrollProcess",
        },
        {
          title: "Payroll Compensation",
          url: "/client/payroll",
        },
        {
          title: "Payroll Calculation",
          url: "/client/payroll/employeePayroll"
        },
      ],
    },
    {
      title: "Reports",
      url: "/client/reports",
      icon: PieChart,
      isActive: true,
    },
    {
      title: "Settings",
      url: "/client/setting",  // Set to "#" since the modal will open without navigating
      icon: Settings2,
      isActive: true,
    }
    
    
  ],
  navUserEmployee: [
    {
      title: "Overview",
      url: "/employee/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title:"Profile",
      url:"/employee/profile",
      icon:Contact,
      isActive: true,

    },
    {
      title: "Attendances",
      url: "/employee/attendances",
      icon: Clipboard,
      isActive: true,
    },
    {
      title: "Request",
      url: "/employee/request",
      icon: Send,
      isActive: true,
    },
    {
      title: "Current PaySlip",
      url: "/employee/payslip",
      icon: DollarSignIcon,
      isActive: true,
    },
    {
      title: "Help Desk",
      url: "/employee/helpdesk",
      icon: CircleHelp,
      isActive: true,
    },
  ],
};

export function AppSidebar({ userType = "client", ...props }) {


    const { data: session } = useSession();
    const isManager = session?.user?.isManager;
  // Determine the navigation data based on the user type
  let navData = null;
  if (userType === "client") {
    navData = data.navMain;
  } else if (userType === "employee") {
    navData = data.navEmployee;
  } else if (userType === "userEmployee") {
    navData = data.navUserEmployee;
  }

  // Conditionally add "Approvals" menu for managers in the "userEmployee" menu
  if (isManager && userType === "userEmployee") {
    navData = [
      ...data.navUserEmployee, // Existing items
      {
        title: "Request Approvals",
        url: "/employee/requestApproval",  // Link to the approval page
        icon: CheckCircle,     // Example icon, can be customized
        isActive: true,
      },
      {
        title: "Attendance Approvals",
        url: "/employee/approvals",  // Link to the approval page
        icon: BriefcaseBusiness,     // Example icon, can be customized
        isActive: true,
      },
    ];
  }

  return (
    <Sidebar variant="inset" {...props}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="bg-foreground">
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={ivilasiLogo.src} alt={data.user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight bar-group">
                  <span className="truncate font-semibold text-foregound bar-group-hover:text-foregound">
                    DASH
                  </span>
                  <span className="truncate text-xs text-foregound bar-group-hover:text-background">Payroll Software</span>
                </div>
              </a>  
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      </motion.div>

      <SidebarContent>
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
        <NavMain items={navData} />
        </motion.div>

     
      </SidebarContent>
      <SidebarFooter>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <NavUser user={data.user} />
        </motion.div>
      </SidebarFooter>

      
    </Sidebar>
  );
}
