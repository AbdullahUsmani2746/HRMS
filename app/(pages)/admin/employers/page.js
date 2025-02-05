// pages/employers.js
"use client";
import EmployerTable from '@/components/EmployerTable';

import Header from "@/components/breadcumb";

  import {
    SidebarInset,
    SidebarTrigger,
  } from "@/components/ui/sidebar"

const Employers = () => {
  

   

    return (
        <>
        <Header heading="Clients" />
        
          <div className="min-h-screen bg-background">
             
               
                <EmployerTable />
            </div>
      </>
      
    );
};

export default Employers;
