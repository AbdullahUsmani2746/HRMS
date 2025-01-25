"use client";

import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
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
  Target
} from "lucide-react";

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
      url: "#",
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
      title: "Employee",
      url: "/client/employee",
      icon: Users,
      isActive: false,
      items:[
    
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
      title: "Pay Schedule",
      url: "/client/schedule",
      icon: CalendarCheckIcon,
      isActive: true,
    },
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
      title: "Attedance",
      url: "/client/attendance",
      icon: Clipboard,
      isActive: true,
    },
    {
      title: "Employee Type",
      url: "/client/employeeType",
      icon: UserCheck2Icon,
      isActive: true,
    },
    { 
      title: "Allownces",
      url: "/client/allownce",
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
    // {
    //   title: "Payroll",
    //   url: "/client/payroll",
    //   icon: LucideUmbrella,
    //   isActive: true,
    // },

    {
      title: "Payroll",
      url: "#",
      icon: LucideUmbrella,
      isActive: true,
      items: [
        {
          title: "Payroll Process",
          url: "/client/payrollProcess",
        },
        {
          title: "Genearate Payroll",
          url: "/client/payroll/employeePayroll"
        },
        
       
      ],
    },
  ],
  navUserEmployee: [
    {
      title: "Dashboard",
      url: "/employee/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Attendances",
      url: "/employee/attendances",
      icon: Clipboard,
      isActive: true,
    },
    {
      title: "Current PaySlip",
      url: "/employee/payslip",
      icon: DollarSignIcon,
      isActive: true,
    },
  ],
};

export function AppSidebar({ userType = "client", isManager = true, ...props }) {
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
        title: "Approvals",
        url: "/employee/approvals",  // Link to the approval page
        icon: BriefcaseBusiness,     // Example icon, can be customized
        isActive: true,
      },
    ];
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
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
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">
                    DASH
                  </span>
                  <span className="truncate text-xs text-white">Payroll Software</span>
                </div>
              </a>  
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
