"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import axios from "axios";

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  },
};

const HelpdeskModal = ({ complaint, onClose }) => {
  const [employeeName, setEmployeeName] = useState("");

  useEffect(() => {
    const fetchEmployeeName = async () => {
      try {
        const response = await axios.get(`/api/employees/${complaint.employeeId}`);
        setEmployeeName(response.data.data || "Unknown Employee");
      } catch (error) {
        console.error("Error fetching employee name:", error);
        setEmployeeName("Unknown Employee");
      }
    };

    if (complaint.employeeId) {
      fetchEmployeeName();
    }
  }, [complaint.employeeId]);

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="bg-foreground border-white/10 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-background">
            Helpdesk Complaint Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-6">
            <div className="space-y-4 p-4 rounded-lg bg-background/5 border border-background/10">
              <div className="grid grid-cols-2 gap-4">
                <motion.div variants={ANIMATION_VARIANTS.item}>
                  <label className="text-sm text-background/60">Complaint #</label>
                  <p className="mt-1 text-background">{complaint.complaintNumber}</p>
                </motion.div>
                <motion.div variants={ANIMATION_VARIANTS.item}>
                  <label className="text-sm text-background/60">Employee ID</label>
                  <p className="mt-1 text-background">{complaint.employeeId}</p>
                </motion.div>
                <motion.div variants={ANIMATION_VARIANTS.item}>
                  <label className="text-sm text-background/60">Date</label>
                  <p className="mt-1 text-background">
                    {format(new Date(complaint.date), "MMM dd, yyyy")}
                  </p>
                </motion.div>
                <motion.div variants={ANIMATION_VARIANTS.item}>
                  <label className="text-sm text-background/60">Employee Name</label>
                  <p className="mt-1 text-background">{employeeName}</p>
                </motion.div>
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-background">Questions</h2>
              <Accordion
                type="single"
                collapsible
                className="border border-background/10 rounded-lg bg-background/5 text-background"
              >
                {complaint.questions?.map((question, index) => (
                  <AccordionItem key={index} value={`question-${index}`} className="border-b border-background/10">
                    <AccordionTrigger className="text-base p-3 space-y-2 font-semibold text-background flex justify-between items-center">
                      #{index + 1}: {question.subject}
                    </AccordionTrigger>
                    <AccordionContent className="p-3 space-y-4">
                      <h3 className="text-sm font-medium text-background/80">Description</h3>
                      <textarea
                        className="w-full p-2 border border-background/10 rounded-md bg-background/5 text-background"
                        disabled
                        value={question.description}
                      />
                      <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-background/80">Answer</h3>

                      <Select
                    value={question.status}
                    disabled
                    
                  >
                    <SelectTrigger className="bg-background/5 border-background/10 text-background w-[200px]">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Rejected", "Resolved", "In Progress"].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type} 
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                      </div>
                      <textarea
                        className="w-full p-2 border border-background/10 rounded-md bg-background/5 text-background"
                        placeholder="Enter your answer here..."
                        disabled = {false ? false : true}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-background/10">
              <Button variant="outline" onClick={onClose} className="border-background/10 text-foreground hover:bg-background/5">
                Close
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HelpdeskModal;
