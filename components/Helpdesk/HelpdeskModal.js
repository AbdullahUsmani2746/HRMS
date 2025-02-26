"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

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
                  <label className="text-sm text-background/60">Category</label>
                  <p className="mt-1 capitalize text-background">{complaint.category}</p>
                </motion.div>
              </div>
            </div>

            {/* Accordion for Questions */}
            <Accordion type="single" collapsible className="border border-background/10 rounded-lg bg-background/5 text-background">
              {complaint.questions?.map((question, index) => (
                <AccordionItem key={index} value={`question-${index}`}>
                  <AccordionTrigger>{question.subject}</AccordionTrigger>
                  <AccordionContent>{question.description}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

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
