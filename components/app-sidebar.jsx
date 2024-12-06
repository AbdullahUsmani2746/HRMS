"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Users,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  LayoutDashboard,
  Send,
  Settings2,
  CircleHelp,
  SquareTerminal,
  CircleDollarSign,
  AppWindowMac
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import ivilasiLogo from "@/public/ivilasi-logo.png"

const data = {
  user: {
    name: "Ivilasi Cunsultant",
    email: "m@example.com",
    avatar: ivilasiLogo,
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
      
    },{
      title: "Reports",
      url: "#",
      icon: PieChart,
      isActive: true,
      
    },{
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
      
    }
    
  ]
  
}

export function AppSidebar({
  ...props
}) {
  return (
    (<Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="bg-[#c41e3a]">
              <a href="#">
                <div
                  className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">Ivilasi Consultant</span>
                  <span className="truncate text-xs text-white">Payroll Softaware</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>)
  );
}
