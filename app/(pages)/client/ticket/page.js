import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TicketIcon, Users, MessageSquare, AlertCircle, 
  ChevronRight, Clock, CheckCircle 
} from 'lucide-react';
import Header from '@/components/breadcumb';

// Dashboard Admin Portal
export const DashboardPortal = () => {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">2,456</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <TicketIcon className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Active Tickets</p>
                <p className="text-2xl font-bold">189</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Escalations</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Resolution Rate</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin-specific features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full">Add New User</Button>
              <Button className="w-full" variant="outline">Manage Permissions</Button>
              <Button className="w-full" variant="outline">View Audit Logs</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>System Status</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Last Backup</span>
                <span className="text-gray-500">2 hours ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Active Sessions</span>
                <span className="text-gray-500">342</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Employer Portal
export const EmployerPortal = () => {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <TicketIcon className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Team Tickets</p>
                <p className="text-2xl font-bold">45</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Team Members</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Management */}
      <Card>
        <CardHeader>
          <CardTitle>Team Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((member) => (
              <div key={member} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div>
                    <p className="font-medium">Team Member {member}</p>
                    <p className="text-sm text-gray-500">Active Tickets: {member * 3}</p>
                  </div>
                </div>
                <Button variant="ghost">View Details</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Employee Portal
export const EmployeePortal = () => {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <Button className="w-full h-24 text-lg">
              Create New Support Ticket
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Button variant="outline" className="w-full h-24 text-lg">
              View My Tickets
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>My Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((ticket) => (
              <div key={ticket} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Ticket #{ticket.toString().padStart(4, '0')}</h3>
                    <p className="text-sm text-gray-500">Created 2 days ago</p>
                  </div>
                  <Badge variant={ticket === 1 ? 'default' : 'success'}>
                    {ticket === 1 ? 'In Progress' : 'Resolved'}
                  </Badge>
                </div>
                <p className="mt-2 text-gray-600">
                  Sample ticket description here. This would show the first few lines of the ticket content.
                </p>
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQs and Help */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Help</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-16">View FAQs</Button>
            <Button variant="outline" className="h-16">Contact Support</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


const TicketForm = () =>{


    return(
<>

<Header heading="Tickets"/>

<div className="p-12 m-12">
<DashboardPortal/>

</div>

<div className="p-12 m-12">

<EmployeePortal/>
</div>
  

<div className="p-12 m-12">
  

<EmployeePortal/>
</div>

</>
        
      )
      

};

export default TicketForm;