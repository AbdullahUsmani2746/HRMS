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
  CalendarCheckIcon,
  Building,
 LucideUmbrella,
  DollarSignIcon,
  MinusCircleIcon,
  BriefcaseBusiness,
  UserCheck2Icon
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
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Subscription",
      url: "/subscription",
      icon: CircleDollarSign,
      isActive: true,
    },
    {
      title: "Applications",
      url: "/application",
      icon: AppWindowMac,
      isActive: true,
    },
    {
      title: "Clients",
      url: "/employers",
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
      title: "Dashboard",
      url: "/client/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Employee",
      url: "/client/employee",
      icon: Users,
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
      title: "Pay Schedule",
      url: "/client/schedule",
      icon: CalendarCheckIcon,
      isActive: true,
    },
    {
      title: "Job Title",
      url: "/client/jobTitle",
      icon: BriefcaseBusiness,
      isActive: true,
    }, {
      title: "Employee Type",
      url: "/client/employeeType",
      icon: UserCheck2Icon,
      isActive: true,
    }, {
      title: "Allownces",
      url: "/client/allownce",
      icon: DollarSignIcon,
      isActive: true,
    }, {
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
  ],
};

export function AppSidebar({ userType = "client", ...props }) {
  // Determine the navigation data based on the user type
  const navData = userType === "client" ? data.navMain : data.navEmployee;

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="bg-foreground">
              <a href="#">
                <div
                  className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={ivilasiLogo.src} alt={data.user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">Ivilasi Consultant</span>
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
