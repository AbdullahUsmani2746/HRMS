// pages/employers.js
"use client";
import Header from "@/components/breadcumb";
import EmployeeTable from "@/components/Employee/EmployeeTable";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
  import { Separator } from "@/components/ui/separator"
  import {
    SidebarInset,
    SidebarTrigger,
  } from "@/components/ui/sidebar"

const Employers = () => {
  

   

    return (
        <>
        <Header heading="Employees" />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div> */}
          {/* <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
          <div className={`transition-width duration-300 flex-1 p-6 `}>
             
               
                <EmployeeTable />
            </div>
        </div>
      </>
      
    );
};

export default Employers;
