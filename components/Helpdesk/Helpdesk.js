'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Save } from "lucide-react";
import { useSession } from "next-auth/react";
const ANIMATION_VARIANTS = {
  container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } },
  item: { hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } }
};

const Helpdesk = () => {
  const {data:session} = useSession();
  const employeeId = session?.user?.username;
  const [tickets, setTickets] = useState([]);
  const [complaintNo, setComplaintNo] = useState(1001);
  const [modalOpen, setModalOpen] = useState(false);
  const [fields, setFields] = useState([{ title: "", description: "" }]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTicket = { id: `TKT-00${complaintNo}`, details: fields, status: "In Progress" };
    setTickets([...tickets, newTicket]);
    setComplaintNo(complaintNo + 1);
    setFields([{ title: "", description: "" }]);
    setModalOpen(false);
  };

  const addField = () => {
    setFields([...fields, { title: "", description: "" }]);
  };

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const updateField = (index, key, value) => {
    const updatedFields = [...fields];
    updatedFields[index][key] = value;
    setFields(updatedFields);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 space-y-6 text-background">
      {/* Ticket View */}
      <Card className="w-full max-w-3xl bg-foreground border-white/10 shadow-xl">
        <CardHeader className=" px-4 py-3 border-b border-background/10">
          <CardTitle className="text-2xl text-background font-bold">Ticket View</CardTitle>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button className=" bg-background text-foreground hover:bg-background/90">Raise New Complaint</Button>
            </DialogTrigger>
            <DialogContent className="bg-foreground border border-white/10">
              <DialogHeader>
                <DialogTitle className="text-background">Raise New Complaint</DialogTitle>
              </DialogHeader>

              {/* Modal Form */}
              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-6"
                variants={ANIMATION_VARIANTS.container}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {fields.map((field, index) => (
                    <motion.div
                      key={index}
                      variants={ANIMATION_VARIANTS.item}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-4 p-4 rounded-lg bg-background/5 border border-background/10"
                    >
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm text-background/60">Title</label>
                          <Input
                            value={field.title}
                            onChange={(e) => updateField(index, "title", e.target.value)}
                            className="bg-transparent border-background/10 text-foreground"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-background/60">Description</label>
                          <Textarea
                            value={field.description}
                            onChange={(e) => updateField(index, "description", e.target.value)}
                            className="bg-transparent border-background/10 text-foreground"
                          />
                        </div>
                      </div>
                      {index > 0 && (
                        <motion.div className="flex justify-end">
                          <Button 
                            type="button" 
                            onClick={() => removeField(index)}
                            variant="destructive"
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Remove
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className="flex justify-between pt-4 border-t border-background/10">
                  <Button 
                    type="button" 
                    onClick={addField}
                    variant="outline"
                    className="border-background/10 text-foreground hover:bg-background/5"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Another
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-background text-foreground hover:bg-background/90"
                  >
                    <Save className="w-4 h-4 mr-2" /> Submit
                  </Button>
                </div>
              </motion.form>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>
    </div>
  );
};

export default Helpdesk;
