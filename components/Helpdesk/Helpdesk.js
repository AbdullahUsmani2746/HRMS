'use client';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from 'axios';
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Save, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from 'react';
import { toast } from 'sonner';

const ANIMATION_VARIANTS = {
  container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } },
  item: { hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } }
};

const Helpdesk = ({ onClose }) => {
  const { data: session } = useSession();
  const employeeId = session?.user?.username;
  const employerId = `CLIENT-${employeeId.split("-")[0]}`
  const [tickets, setTickets] = useState([]);
  const [fields, setFields] = useState([{ title: "", description: "" }]);
  const isDash = session?.user?.isDash || true;
  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedFields = fields.map(field => ({
      title: field.title.trim(),
      description: field.description.trim()
    }));

    const hasEmptyFields = cleanedFields.some(field => field.title === "" || field.description === "");

    if (hasEmptyFields) {
      toast.error("All fields are required!", {
        className: 'bg-red-500 text-white',
      });
      return;
    }

    const newTicket = {
      employeeId,
      employerId,
      isAdmin:isDash ? true : false,
      questions: fields.map(field => ({ subject: field.title, description: field.description })),
    };

    try {
      const response = await axios.post(`/api/helpdesk/${employeeId}`, newTicket, {
        headers: { "Content-Type": "application/json" }
      });

      setTickets([...tickets, response.data]);
      setFields([{ title: "", description: "" }]);

      toast.success("Complaint submitted successfully!", {
        className: 'bg-green-500 text-white',
      });
      onClose()

    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to submit complaint.");
    } 
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
    <>
      <Card className="w-full max-w-3xl bg-foreground border-white/10 shadow-xl">
        <CardHeader className="px-4 py-3 border-b border-background/10">
          <CardTitle className="text-2xl text-background font-bold mb-3">Raise New Complaint</CardTitle>

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
                    <h3 className="text-lg font-semibold text-background">Question {index + 1}</h3>

                    <div className="space-y-2">
                      <label className="text-sm text-background/60">Subject</label>
                      <Input
                        value={field.title}
                        onChange={(e) => updateField(index, "title", e.target.value)}
                        placeholder="Enter subject"
                        className="bg-transparent border-background/10 text-background placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-background/60">Description</label>
                      <Textarea
                        value={field.description}
                        onChange={(e) => updateField(index, "description", e.target.value)}
                        placeholder="Enter description"
                        className="bg-transparent border-background/10 text-background placeholder:text-gray-400"
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
        </CardHeader>
      </Card>
    </>
  );
};

export default Helpdesk;
