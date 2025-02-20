"use client"
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Clock, CheckCircle, MessageSquare } from 'lucide-react';

export const TicketManagement = ({ userRole }) => {
  const [activeTicket, setActiveTicket] = useState(null);
  const [ticketFormVisible, setTicketFormVisible] = useState(false);

  const TicketForm = () => (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Create New Ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="Brief description of the issue" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Category</label>
            <Select>
              <option>Technical Support</option>
              <option>HR Query</option>
              <option>Financial Query</option>
              <option>General Inquiry</option>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Priority</label>
            <Select>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              placeholder="Detailed description of your issue"
              className="h-32"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Attachments</label>
            <Input type="file" multiple />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setTicketFormVisible(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Ticket</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const TicketDetails = ({ ticket }) => (
    <Card className="p-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Ticket #{ticket.id}</CardTitle>
            <p className="text-sm text-gray-500">Created on {ticket.createdAt}</p>
          </div>
          <Badge variant={ticket.status === 'Open' ? 'default' : 'success'}>
            {ticket.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium">Description</h3>
          <p className="text-gray-600">{ticket.description}</p>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Conversation</h3>
          {ticket.messages.map((message, index) => (
            <div 
              key={index}
              className={`flex ${
                message.isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className={`
                max-w-[80%] p-3 rounded-lg
                ${message.isUser ? 'bg-blue-50' : 'bg-gray-50'}
              `}>
                <p className="text-sm font-medium">{message.author}</p>
                <p className="text-gray-600">{message.content}</p>
                <p className="text-xs text-gray-400 mt-1">{message.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Textarea placeholder="Type your response..." className="h-24" />
          <div className="flex justify-end space-x-2">
            {userRole !== 'employee' && (
              <Select defaultValue="open" className="w-40">
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </Select>
            )}
            <Button>Send Response</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ticket Management</h2>
        {userRole === 'employee' && (
          <Button onClick={() => setTicketFormVisible(true)}>
            Create New Ticket
          </Button>
        )}
      </div>

      {ticketFormVisible ? (
        <TicketForm />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tickets Overview</CardTitle>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Search tickets..." 
                  className="w-64"
                />
                <Select defaultValue="all" className="w-40">
                  <option value="all">All Tickets</option>
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active">
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                {/* Sample tickets list */}
                <div className="space-y-2">
                  {[1, 2, 3].map((ticket) => (
                    <div
                      key={ticket}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setActiveTicket(ticket)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">
                            Ticket #{ticket.toString().padStart(4, '0')}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Last updated 2 hours ago
                          </p>
                        </div>
                        <Badge>Open</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {activeTicket && (
        <TicketDetails 
          ticket={{
            id: activeTicket,
            status: 'Open',
            createdAt: '2024-02-12',
            description: 'Sample ticket description...',
            messages: [
              {
                author: 'John Doe',
                content: 'Initial ticket description...',
                time: '2 hours ago',
                isUser: true
              },
              {
                author: 'Support Team',
                content: 'Thank you for reaching out...',
                time: '1 hour ago',
                isUser: false
              }
            ]
          }} 
        />
      )}
    </div>
  );
};

export default TicketManagement;